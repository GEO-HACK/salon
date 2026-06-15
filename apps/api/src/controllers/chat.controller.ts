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

  if (response.type === 'tool_call' && response.name === 'create_booking') {
    const { clientName, phone, serviceId, slotId } = response.args

    try {
      const booking = await createBooking({ guestName: clientName, guestPhone: phone, serviceId, slotId })

      const [service, slot] = await Promise.all([
        Service.findById(serviceId).lean(),
        Slot.findById(slotId).lean(),
      ])

      return res.json({
        type: 'booking_confirmed',
        message: `Your booking is confirmed, ${clientName}! We'll send a WhatsApp confirmation to ${phone} shortly. See you soon! 💅`,
        booking: {
          id: booking._id,
          clientName,
          phone,
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
          message: "I'm sorry, that slot was just taken by another client! Let me check what else is available for you.",
        })
      }
      throw err
    }
  }

  return res.json({
    type: 'message',
    message: response.type === 'message' ? response.text : "Sorry, I had trouble responding. Please try again.",
  })
}
