import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.model'
import { UserRole } from '../models/UserRole.model'

interface JwtPayload {
  userId: string
  email: string
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.slice(7)

  let payload: JwtPayload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const [user, roleDoc] = await Promise.all([
    User.findById(payload.userId).lean(),
    UserRole.findOne({ userId: payload.userId }).lean(),
  ])

  if (!user || !roleDoc) {
    return res.status(401).json({ error: 'User not found' })
  }

  req.userId = payload.userId
  req.userRole = roleDoc.role
  next()
}
