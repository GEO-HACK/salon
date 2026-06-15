'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  _id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string
  createdAt: string
  serviceId: { name: string; price: number; durationMinutes: number }
  slotId: { date: string; startTime: string; endTime: string }
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-neutral-100 text-neutral-500',
  completed: 'bg-brand-pink-light text-brand-pink',
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!session?.apiToken) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/mine`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false))
  }, [session?.apiToken])

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${session?.apiToken}` },
    })
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
      )
    }
    setCancelling(null)
  }

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-pink border-t-transparent animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-brand-cream">
      <div className="max-w-4xl mx-auto px-6 py-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-pink transition-colors mb-10"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-10">
          <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-2">My Account</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">My Bookings</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center">
            <p className="text-4xl mb-4">📅</p>
            <p className="font-serif text-xl text-brand-charcoal mb-2">No bookings yet</p>
            <p className="text-sm text-neutral-500 mb-6">
              Use the chat widget or browse our services to book your first appointment.
            </p>
            <Link
              href="/services"
              className="inline-block px-8 py-3 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-colors"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const date = new Date(b.slotId.date).toLocaleDateString('en-KE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              const canCancel = b.status === 'confirmed' || b.status === 'pending'

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-serif text-lg text-brand-charcoal">
                        {b.serviceId.name}
                      </p>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${statusColors[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {date} · {b.slotId.startTime}–{b.slotId.endTime}
                    </p>
                    <p className="text-sm text-brand-pink font-medium mt-1">
                      KES {b.serviceId.price.toLocaleString()} · {b.serviceId.durationMinutes} min
                    </p>
                    {b.notes && (
                      <p className="text-xs text-neutral-400 mt-1">Note: {b.notes}</p>
                    )}
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancelling === b._id}
                      className="text-sm text-neutral-400 hover:text-rose-500 transition-colors underline underline-offset-4 disabled:opacity-50 shrink-0"
                    >
                      {cancelling === b._id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
