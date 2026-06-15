import type { Request, Response } from 'express'
import { CreateBookingSchema } from '@beauty-brand/shared'
import { Booking } from '../models/Booking.model'
import { Slot } from '../models/Slot.model'
import { createBooking } from '../services/BookingService'

export async function createBookingHandler(req: Request, res: Response) {
  const result = CreateBookingSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const { serviceId, slotId, notes } = result.data

  try {
    const booking = await createBooking({ userId: req.userId, serviceId, slotId, notes })
    return res.status(201).json({ booking })
  } catch (err: any) {
    if (err.message === 'SLOT_UNAVAILABLE') {
      return res.status(409).json({ error: 'This slot is no longer available' })
    }
    throw err
  }
}

export async function getMyBookings(req: Request, res: Response) {
  const bookings = await Booking.find({ userId: req.userId })
    .populate('serviceId', 'name price durationMinutes')
    .populate('slotId', 'date startTime endTime')
    .sort({ createdAt: -1 })
    .lean()
  return res.json({ bookings })
}

export async function getAllBookings(req: Request, res: Response) {
  const bookings = await Booking.find()
    .populate('userId', 'name email phone')
    .populate('serviceId', 'name price')
    .populate('slotId', 'date startTime endTime')
    .sort({ createdAt: -1 })
    .lean()
  return res.json({ bookings })
}

export async function cancelBooking(req: Request, res: Response) {
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId })
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking is already cancelled' })
  }
  if (booking.status === 'completed') {
    return res.status(400).json({ error: 'Cannot cancel a completed booking' })
  }

  booking.status = 'cancelled'
  await booking.save()
  await Slot.findByIdAndUpdate(booking.slotId, { isBooked: false })

  return res.json({ booking })
}

export async function completeBooking(req: Request, res: Response) {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: 'completed' },
    { new: true }
  )
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  return res.json({ booking })
}
