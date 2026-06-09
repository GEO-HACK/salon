import { Schema, model } from 'mongoose'

const UserRoleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, enum: ['client', 'admin'], required: true },
  assignedBy: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
})

export const UserRole = model('UserRole', UserRoleSchema)
