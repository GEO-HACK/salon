import type { Request, Response, NextFunction } from 'express'

export function requireRole(role: 'client' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
