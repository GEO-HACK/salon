export interface IUser {
  _id: string
  name: string
  email: string
  passwordHash: string
  phone: string
  createdAt: Date
}

export type IUserPublic = Omit<IUser, 'passwordHash'>

export interface IUserRole {
  _id: string
  userId: string
  role: 'client' | 'admin'
  assignedBy: string
  assignedAt: Date
}

export interface IService {
  _id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl: string
  isActive: boolean
  createdAt: Date
}

export interface ISlot {
  _id: string
  date: Date
  startTime: string
  endTime: string
  isBooked: boolean
  isBlocked: boolean
  createdAt: Date
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface IBooking {
  _id: string
  userId: string
  serviceId: string
  slotId: string
  status: BookingStatus
  whatsappSent: boolean
  reminderSent: boolean
  notes: string
  createdAt: Date
}

export type NotificationType = 'confirmation' | 'reminder' | 'admin_alert'
export type NotificationStatus = 'sent' | 'failed'

export interface INotificationLog {
  _id: string
  bookingId: string
  type: NotificationType
  sentAt: Date
  status: NotificationStatus
  phoneNumber: string
  errorMessage?: string
}
