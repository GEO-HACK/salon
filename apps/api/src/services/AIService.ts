import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'
import { Slot } from '../models/Slot.model'
import { Booking } from '../models/Booking.model'
import { createBooking } from './BookingService'

// ---------------------------------------------------------------------------
// Client — lazily created so the API key/base URL are read at request time,
// after dotenv.config() has run (ES module imports execute before index.ts
// calls dotenv.config(), so reading env at import time would be too early).
//
// Provider-agnostic: any OpenAI-compatible endpoint works by setting
// AI_BASE_URL + AI_MODEL. Defaults to Groq's free tier (no credit card,
// Llama 3.3 70B supports the agentic tool loop). To use xAI Grok instead:
//   AI_API_KEY=<xai key>  AI_BASE_URL=https://api.x.ai/v1  AI_MODEL=grok-3
// ---------------------------------------------------------------------------
let client: OpenAI | null = null
function getClient() {
  if (!client) {
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) throw new Error('AI_API_KEY is not set')
    const baseURL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1'
    client = new OpenAI({ apiKey, baseURL })
  }
  return client
}

// Configurable without code changes — set AI_MODEL in .env. Read at request
// time for the same import-order reason as the client above.
function getModelName() {
  return process.env.AI_MODEL || 'llama-3.3-70b-versatile'
}

const MAX_RETRIES = 3
// Safeguard against an unbounded tool loop if the model keeps calling tools.
const MAX_TOOL_ITERATIONS = 10

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Providers occasionally return 503 (high demand) or 429 (rate limit).
// These are transient — retry with exponential backoff before giving up.
function isTransient(err: any) {
  const msg = String(err?.message ?? '')
  return msg.includes('503') || msg.includes('429') || msg.includes('overloaded') || msg.includes('high demand')
}

// ---------------------------------------------------------------------------
// Tool definitions — 6 tools exposed to the agent (OpenAI function format)
// ---------------------------------------------------------------------------
const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check which time slots are open on a given date. Always call this before offering or booking a slot — never invent availability.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date to check in YYYY-MM-DD format' },
          serviceId: { type: 'string', description: 'Optional MongoDB ID of the service the client wants' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_booking',
      description: 'Create a confirmed booking once the client name, phone, service and an available slot are all known.',
      parameters: {
        type: 'object',
        properties: {
          clientName: { type: 'string', description: 'Full name of the client' },
          phone: { type: 'string', description: 'Client phone in E.164 format e.g. +254712345678' },
          serviceId: { type: 'string', description: 'MongoDB ID of the chosen service' },
          slotId: { type: 'string', description: 'MongoDB ID of the chosen available slot' },
        },
        required: ['clientName', 'phone', 'serviceId', 'slotId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_client_bookings',
      description: "Look up a client's existing bookings by their phone number. Use this before cancelling or rescheduling.",
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Client phone number used when booking' },
        },
        required: ['phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking',
      description: 'Cancel an existing booking and free up its slot.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'MongoDB ID of the booking to cancel' },
          reason: { type: 'string', description: 'Optional reason for cancellation' },
        },
        required: ['bookingId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_booking',
      description: 'Move an existing booking to a new available slot.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'MongoDB ID of the booking to reschedule' },
          newSlotId: { type: 'string', description: 'MongoDB ID of the new available slot' },
        },
        required: ['bookingId', 'newSlotId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_whatsapp_confirmation',
      description: 'Send a WhatsApp confirmation message for a booking. Call this after every successful booking or reschedule.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'MongoDB ID of the booking to confirm' },
        },
        required: ['bookingId'],
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Tool executor — runs the actual DB work for a tool call
// ---------------------------------------------------------------------------

// Parse a YYYY-MM-DD string into start/end of that day in server-local time,
// matching how slots are stored (seeded at local midnight).
function dayBounds(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)
  const end = new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999)
  return { start, end }
}

async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'check_availability': {
      const { start, end } = dayBounds(args.date)
      const slots = await Slot.find({
        date: { $gte: start, $lte: end },
        isBooked: false,
        isBlocked: false,
      })
        .sort({ startTime: 1 })
        .lean()
      return { available: slots.length > 0, slots }
    }

    case 'create_booking': {
      try {
        const booking = await createBooking({
          guestName: args.clientName,
          guestPhone: args.phone,
          serviceId: args.serviceId,
          slotId: args.slotId,
        })
        return { success: true, bookingId: String(booking._id) }
      } catch (err: any) {
        if (err.message === 'SLOT_UNAVAILABLE') {
          return { success: false, error: 'That slot was just taken — please pick another.' }
        }
        return { success: false, error: 'Could not create the booking.' }
      }
    }

    case 'get_client_bookings': {
      // Phone is stored on the booking's guestPhone field; also match notes as a fallback.
      const phone = String(args.phone ?? '')
      const bookings = await Booking.find({
        $or: [{ guestPhone: phone }, { notes: { $regex: phone, $options: 'i' } }],
      })
        .populate('serviceId', 'name price durationMinutes')
        .populate('slotId', 'date startTime endTime')
        .sort({ createdAt: -1 })
        .lean()
      return { bookings }
    }

    case 'cancel_booking': {
      const booking = await Booking.findById(args.bookingId)
      if (!booking) return { success: false, error: 'Booking not found' }
      booking.status = 'cancelled'
      if (args.reason) booking.notes = `${booking.notes} | Cancelled: ${args.reason}`.trim()
      await booking.save()
      await Slot.findByIdAndUpdate(booking.slotId, { isBooked: false })
      return { success: true }
    }

    case 'reschedule_booking': {
      const booking = await Booking.findById(args.bookingId)
      if (!booking) return { success: false, error: 'Booking not found' }

      const newSlot = await Slot.findOne({ _id: args.newSlotId, isBooked: false, isBlocked: false })
      if (!newSlot) return { success: false, error: 'The new slot is not available.' }

      const oldSlotId = booking.slotId
      newSlot.isBooked = true
      await newSlot.save()
      if (String(oldSlotId) !== String(args.newSlotId)) {
        await Slot.findByIdAndUpdate(oldSlotId, { isBooked: false })
      }
      booking.slotId = args.newSlotId
      booking.status = 'confirmed'
      await booking.save()
      return { success: true }
    }

    case 'send_whatsapp_confirmation': {
      // STUB: the real WhatsAppService arrives in Phase 5 (Meta Cloud API).
      // For now mark the booking as notified and log, so the agent flow is complete.
      const booking = await Booking.findByIdAndUpdate(
        args.bookingId,
        { whatsappSent: true },
        { new: true }
      )
      if (!booking) return { success: false, error: 'Booking not found' }
      console.log(`[whatsapp:stub] confirmation queued for booking ${args.bookingId}`)
      return { success: true }
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
function buildSystemPrompt(services: any[], slots: any[]) {
  const servicesList = services
    .map((s) => `- ${s.name}: KES ${s.price}, ${s.durationMinutes} mins (ID: ${s._id})`)
    .join('\n')

  const slotsHint = slots
    .slice(0, 10)
    .map((s) => {
      const d = new Date(s.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
      return `- ${d} (${new Date(s.date).toISOString().slice(0, 10)}) at ${s.startTime}–${s.endTime}`
    })
    .join('\n')

  return `You are a fully autonomous booking assistant for Beauty Brand, a luxury hair and beauty salon in Nairobi, Kenya. You serve both female and male clients.

When a client wants to BOOK:
1. Call check_availability for their preferred date
2. If no slots available, automatically check the next 3 days and suggest alternatives
3. Once slot is agreed, call create_booking immediately
4. Always call send_whatsapp_confirmation after every successful booking
5. Confirm to the user with full booking details

When a client wants to CANCEL:
1. Call get_client_bookings with their phone number
2. Identify the correct booking
3. Call cancel_booking
4. Confirm cancellation to the user

When a client wants to RESCHEDULE:
1. Call get_client_bookings to find existing booking
2. Call check_availability for new preferred date
3. Call reschedule_booking
4. Call send_whatsapp_confirmation
5. Confirm new booking details to user

Rules:
- Never invent availability — always call check_availability first
- Collect name, phone, service preference before booking
- Complete all steps autonomously without asking the user to wait
- Stay on topic — redirect unrelated questions back to booking
- Be warm, professional, and concise

Available services (use these IDs):
${servicesList || 'No services currently available.'}

Some upcoming availability for reference (still call check_availability to confirm):
${slotsHint || 'No slots currently loaded.'}

Today's date is ${new Date().toISOString().slice(0, 10)}.`
}

// ---------------------------------------------------------------------------
// Public types — kept identical so the controller needs no changes
// ---------------------------------------------------------------------------
export type AgentResponse =
  | { type: 'message'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, string> }

// Wrap a completion call with transient-error retry + exponential backoff.
async function createCompletionWithRetry(messages: ChatCompletionMessageParam[]) {
  let lastErr: any
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await getClient().chat.completions.create({
        model: getModelName(),
        messages,
        tools: TOOLS,
      })
    } catch (err) {
      lastErr = err
      if (!isTransient(err) || attempt === MAX_RETRIES - 1) throw err
      await sleep(500 * 2 ** attempt) // 500ms, 1s, 2s
    }
  }
  throw lastErr
}

// ---------------------------------------------------------------------------
// Agentic loop — runs tools autonomously until the model produces a final
// text answer with no further tool calls.
// ---------------------------------------------------------------------------
export async function chatWithAgent(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  services: any[],
  slots: any[]
): Promise<AgentResponse> {
  const convo: ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(services, slots) },
    ...messages.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
  ]

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const completion = await createCompletionWithRetry(convo)
    const choice = completion.choices[0].message

    // No tool calls → this is the final answer for the user.
    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return { type: 'message', text: choice.content ?? '' }
    }

    // Record the assistant's tool-call turn, then execute each tool and feed
    // the results back into the conversation.
    convo.push(choice)
    for (const toolCall of choice.tool_calls) {
      if (toolCall.type !== 'function') continue
      let args: any = {}
      try {
        args = JSON.parse(toolCall.function.arguments || '{}')
      } catch {
        args = {}
      }
      const result = await executeTool(toolCall.function.name, args)
      convo.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      })
    }
  }

  // Safety net: hit the iteration cap without a final message.
  return {
    type: 'message',
    text: "I've started working on that but need a moment — could you confirm the details once more?",
  }
}
