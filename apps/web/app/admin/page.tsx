import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'admin') redirect('/dashboard')

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-brand-cream">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-2">Admin</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">Admin Dashboard</h1>
          <p className="text-neutral-600 mt-2 text-sm">
            Full admin controls are built in Phase 6.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {['Manage Bookings', 'Slot Manager', 'Services', 'Notifications'].map((item) => (
            <div key={item} className="bg-white rounded-2xl p-7 border border-neutral-100">
              <p className="font-serif text-lg text-brand-charcoal mb-2">{item}</p>
              <p className="text-xs text-brand-gold tracking-wide">Phase 6</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
