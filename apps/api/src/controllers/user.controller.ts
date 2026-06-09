import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { UpdateProfileSchema, ChangePasswordSchema } from '@beauty-brand/shared'
import { User } from '../models/User.model'

export async function updateProfile(req: Request, res: Response) {
  const result = UpdateProfileSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const { name, phone } = result.data
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, phone },
    { new: true }
  ).select('-passwordHash').lean()

  if (!user) return res.status(404).json({ error: 'User not found' })

  return res.json({ user })
}

export async function changePassword(req: Request, res: Response) {
  const result = ChangePasswordSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const { currentPassword, newPassword } = result.data

  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()

  return res.json({ message: 'Password updated successfully' })
}
