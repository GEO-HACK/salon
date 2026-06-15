import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-brand-cream">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-2">My Account</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">
            Welcome, {session.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-neutral-600 mt-2 text-sm">
            Manage your bookings and account details here.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <Link
            href="/services"
            className="bg-white rounded-2xl p-7 border border-neutral-100 hover:border-brand-pink hover:shadow-sm transition-all group"
          >
            <span className="text-3xl mb-4 block">✂️</span>
            <p className="font-serif text-lg text-brand-charcoal group-hover:text-brand-pink transition-colors">
              Book a Service
            </p>
            <p className="text-sm text-neutral-500 mt-1">Browse and book any of our services</p>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="bg-white rounded-2xl p-7 border border-neutral-100 hover:border-brand-pink hover:shadow-sm transition-all group"
          >
            <span className="text-3xl mb-4 block">📅</span>
            <p className="font-serif text-lg text-brand-charcoal group-hover:text-brand-pink transition-colors">
              My Bookings
            </p>
            <p className="text-sm text-neutral-500 mt-1">View and manage your appointments</p>
          </Link>

          <Link
            href="/dashboard/profile"
            className="bg-white rounded-2xl p-7 border border-neutral-100 hover:border-brand-pink hover:shadow-sm transition-all group"
          >
            <span className="text-3xl mb-4 block">👤</span>
            <p className="font-serif text-lg text-brand-charcoal group-hover:text-brand-pink transition-colors">
              Profile
            </p>
            <p className="text-sm text-neutral-500 mt-1">Update your name, phone and password</p>
          </Link>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-7">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Account Details</p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4">
              <span className="text-neutral-400 w-20 shrink-0">Name</span>
              <span className="text-brand-charcoal font-medium">{session.user?.name}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-neutral-400 w-20 shrink-0">Email</span>
              <span className="text-brand-charcoal">{session.user?.email}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-neutral-400 w-20 shrink-0">Role</span>
              <span className="capitalize text-brand-charcoal">{session.user?.role}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
