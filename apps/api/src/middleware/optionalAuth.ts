import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  email: string
}

// Like `authenticate`, but never rejects. If a valid Bearer token is present
// it attaches req.userId; otherwise the request proceeds as a guest. Used on
// the public chat endpoint so AI bookings link to a logged-in user when one
// exists, while still allowing anonymous guests to book.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET!) as JwtPayload
      req.userId = payload.userId
    } catch {
      // ignore invalid token — treat as guest
    }
  }
  next()
}
