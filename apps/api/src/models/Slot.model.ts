import { Schema, model } from 'mongoose'
import type { ISlot } from '@beauty-brand/shared'

const SlotSchema = new Schema<ISlot>(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
)

SlotSchema.index({ date: 1, startTime: 1 })

export const Slot = model<ISlot>('Slot', SlotSchema)
