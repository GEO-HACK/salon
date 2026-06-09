import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+254\d{9}$/, 'Phone must be in E.164 format e.g. +254712345678'),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const CreateServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  imageUrl: z.string().url().optional().default(''),
})

export const CreateSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
})

export const CreateBookingSchema = z.object({
  serviceId: z.string().length(24, 'Invalid service ID'),
  slotId: z.string().length(24, 'Invalid slot ID'),
  notes: z.string().max(500).optional().default(''),
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+254\d{9}$/, 'Phone must be in E.164 format e.g. +254712345678'),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>
export type CreateSlotInput = z.infer<typeof CreateSlotSchema>
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
