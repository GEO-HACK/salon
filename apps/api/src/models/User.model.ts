import { Schema, model } from 'mongoose'
import type { IUser } from '@beauty-brand/shared'

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', UserSchema)
