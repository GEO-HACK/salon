import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CREATE_BOOKING_TOOL: Anthropic.Tool = {
  name: 'create_booking',
  description: 'Creates a confirmed booking once all client details have been collected.',
  input_schema: {
    type: 'object',
    properties: {
      clientName: { type: 'string', description: 'Full name of the client' },
      phone: {
        type: 'string',
        description: 'Client phone in E.164 format e.g. +254712345678',
      },
      serviceId: { type: 'string', description: 'ID of the service to book' },
      slotId: { type: 'string', description: 'ID of the time slot to book' },
    },
    required: ['clientName', 'phone', 'serviceId', 'slotId'],
  },
}

function buildSystemPrompt(services: any[], slots: any[]) {
  const servicesList = services
    .map((s) => `- ${s.name}: KES ${s.price}, ${s.durationMinutes} mins (ID: ${s._id})`)
    .join('\n')

  const slotsList = slots
    .map((s) => {
      const d = new Date(s.date).toLocaleDateString('en-KE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
      return `- ${d} at ${s.startTime}–${s.endTime} (ID: ${s._id})`
    })
    .join('\n')

  return `You are a booking assistant for Beauty Brand, a luxury hair and beauty salon in Nairobi, Kenya. You serve both female and male clients.

Your ONLY job is to help clients book appointments. Do not answer unrelated questions.

Available services:
${servicesList || 'No services currently available.'}

Rules:
- Only offer slots from the available list below — never invent availability
- Collect from the client: full name, desired service, preferred date/time, and phone number (+254 format)
- Once you have all details matched to an available slot and service ID, immediately call create_booking
- Be warm, professional, and concise
- If asked something unrelated, politely redirect to booking

Available slots (upcoming):
${slotsList || 'No slots available right now. Apologise and ask them to check back soon.'}`
}

export async function chatWithAgent(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  services: any[],
  slots: any[]
) {
  return anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystemPrompt(services, slots),
    tools: [CREATE_BOOKING_TOOL],
    messages: messages as MessageParam[],
  })
}
