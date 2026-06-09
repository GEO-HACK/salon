import { Schema, model } from 'mongoose'
import type { IService } from '@beauty-brand/shared'

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Service = model<IService>('Service', ServiceSchema)
