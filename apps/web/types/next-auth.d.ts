import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
    } & DefaultSession['user']
    apiToken: string
  }

  interface User {
    role: string
    token: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    apiToken: string
  }
}
