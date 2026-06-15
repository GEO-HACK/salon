import mongoose from 'mongoose'
import { Slot } from '../models/Slot.model'
import { Booking } from '../models/Booking.model'

interface CreateBookingParams {
  userId?: string
  guestName?: string
  guestPhone?: string
  serviceId: string
  slotId: string
  notes?: string
}

export async function createBooking(params: CreateBookingParams) {
  const session = await mongoose.startSession()

  try {
    let booking: any

    await session.withTransaction(async () => {
      const slot = await Slot.findOne({
        _id: params.slotId,
        isBooked: false,
        isBlocked: false,
      }).session(session)

      if (!slot) throw new Error('SLOT_UNAVAILABLE')

      slot.isBooked = true
      await slot.save({ session })

      const [created] = await Booking.create(
        [
          {
            userId: params.userId ?? null,
            guestName: params.guestName ?? '',
            guestPhone: params.guestPhone ?? '',
            serviceId: params.serviceId,
            slotId: params.slotId,
            status: 'confirmed',
            notes: params.notes ?? '',
          },
        ],
        { session }
      )

      booking = created
    })

    return booking
  } finally {
    await session.endSession()
  }
}
