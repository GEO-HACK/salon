import { Schema, model } from 'mongoose'

const NotificationLogSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  type: { type: String, enum: ['confirmation', 'reminder', 'admin_alert'], required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  phoneNumber: { type: String, required: true },
  errorMessage: { type: String },
})

export const NotificationLog = model('NotificationLog', NotificationLogSchema)
