import type { Request, Response } from 'express'
import { Service } from '../models/Service.model'
import { Slot } from '../models/Slot.model'
import { chatWithAgent } from '../services/AIService'
import { createBooking } from '../services/BookingService'

export async function chat(req: Request, res: Response) {
  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const [services, slots] = await Promise.all([
    Service.find({ isActive: true }).lean(),
    Slot.find({ date: { $gte: new Date() }, isBooked: false, isBlocked: false })
      .sort({ date: 1, startTime: 1 })
      .limit(20)
      .lean(),
  ])

  const response = await chatWithAgent(messages, services, slots)

  if (response.stop_reason === 'tool_use') {
    const toolBlock = response.content.find((b) => b.type === 'tool_use')

    if (toolBlock?.type === 'tool_use' && toolBlock.name === 'create_booking') {
      const input = toolBlock.input as {
        clientName: string
        phone: string
        serviceId: string
        slotId: string
      }

      try {
        const booking = await createBooking({
          guestName: input.clientName,
          guestPhone: input.phone,
          serviceId: input.serviceId,
          slotId: input.slotId,
        })

        const [service, slot] = await Promise.all([
          Service.findById(input.serviceId).lean(),
          Slot.findById(input.slotId).lean(),
        ])

        return res.json({
          type: 'booking_confirmed',
          message: `Your booking is confirmed, ${input.clientName}! We'll send a WhatsApp confirmation to ${input.phone} shortly. See you soon! 💅`,
          booking: {
            id: booking._id,
            clientName: input.clientName,
            phone: input.phone,
            service: (service as any)?.name ?? '',
            price: (service as any)?.price ?? 0,
            date: slot
              ? new Date((slot as any).date).toLocaleDateString('en-KE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : '',
            time: (slot as any)?.startTime ?? '',
          },
        })
      } catch (err: any) {
        if (err.message === 'SLOT_UNAVAILABLE') {
          return res.json({
            type: 'message',
            message:
              "I'm sorry, that slot was just taken by another client! Let me check what else is available for you.",
          })
        }
        throw err
      }
    }
  }

  const textBlock = response.content.find((b) => b.type === 'text')
  return res.json({
    type: 'message',
    message:
      textBlock?.type === 'text'
        ? textBlock.text
        : "Sorry, I had trouble responding. Please try again.",
  })
}
