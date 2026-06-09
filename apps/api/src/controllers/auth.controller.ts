import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RegisterSchema, LoginSchema } from '@beauty-brand/shared'
import { User } from '../models/User.model'
import { UserRole } from '../models/UserRole.model'

function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  })
}

export async function register(req: Request, res: Response) {
  const result = RegisterSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const { name, email, password, phone } = result.data

  const existing = await User.findOne({ email }).lean()
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await User.create({ name, email, passwordHash, phone })
  await UserRole.create({ userId: user._id, role: 'client', assignedBy: 'system' })

  const token = signToken(user._id.toString(), user.email)

  return res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
    role: 'client',
  })
}

export async function login(req: Request, res: Response) {
  const result = LoginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  const { email, password } = result.data

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const roleDoc = await UserRole.findOne({ userId: user._id }).lean()
  if (!roleDoc) {
    return res.status(401).json({ error: 'Account not properly configured' })
  }

  const token = signToken(user._id.toString(), user.email)

  return res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
    role: roleDoc.role,
  })
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.userId).select('-passwordHash').lean()
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  return res.json({ user, role: req.userRole })
}
