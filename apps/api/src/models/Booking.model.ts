import { Schema, model } from 'mongoose'

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    guestName: { type: String, default: '' },
    guestPhone: { type: String, default: '' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    whatsappSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Booking = model('Booking', BookingSchema)
