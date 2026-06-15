import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AuthSessionProvider from '@/components/providers/SessionProvider'
import ChatWidget from '@/components/ChatWidget'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Beauty Brand | Luxury Salon — Nairobi',
  description: "Nairobi's premier luxury hair and beauty salon. Book your transformation today.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AuthSessionProvider>
          <Navbar />
          {children}
          <Footer />
          <ChatWidget />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
