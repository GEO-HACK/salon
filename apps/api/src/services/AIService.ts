import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const CREATE_BOOKING_FUNCTION = {
  name: 'create_booking',
  description: 'Creates a confirmed booking once all client details have been collected.',
  parameters: {
    type: 'object',
    properties: {
      clientName: { type: 'string', description: 'Full name of the client' },
      phone: { type: 'string', description: 'Client phone in E.164 format e.g. +254712345678' },
      serviceId: { type: 'string', description: 'MongoDB ID of the chosen service' },
      slotId: { type: 'string', description: 'MongoDB ID of the chosen time slot' },
    },
    required: ['clientName', 'phone', 'serviceId', 'slotId'],
  },
} as any

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

export type AgentResponse =
  | { type: 'message'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, string> }

export async function chatWithAgent(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  services: any[],
  slots: any[]
): Promise<AgentResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: buildSystemPrompt(services, slots),
    tools: [{ functionDeclarations: [CREATE_BOOKING_FUNCTION] }],
  })

  const rawHistory = messages.slice(0, -1).map((m) => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }],
  }))
  // Gemini requires history to start with a 'user' turn (skip any leading assistant/welcome messages)
  const firstUserIdx = rawHistory.findIndex((m) => m.role === 'user')
  const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : []

  const lastMessage = messages[messages.length - 1]
  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage.content)
  const response = result.response

  const functionCall = response.functionCalls()?.[0]
  if (functionCall) {
    return {
      type: 'tool_call',
      name: functionCall.name,
      args: functionCall.args as Record<string, string>,
    }
  }

  return { type: 'message', text: response.text() }
}
