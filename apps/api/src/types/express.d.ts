declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: 'client' | 'admin'
    }
  }
}

export {}
