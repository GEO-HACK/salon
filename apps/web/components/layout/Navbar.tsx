'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { data: session } = useSession()
  const isLoggedIn = !!session

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-pink-light">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-lg tracking-[0.2em] uppercase text-brand-charcoal hover:text-brand-pink transition-colors"
        >
          Beauty Brand
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-neutral-500 hover:text-brand-pink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Notification bell */}
              <button
                aria-label="Notifications"
                className="relative w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-brand-pink transition-colors rounded-full hover:bg-brand-pink-light"
              >
                <BellIcon />
                {/* Unread dot — wire up to real count in Phase 5 */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full ring-2 ring-white" />
              </button>

              {/* Profile avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-label="Profile menu"
                  className="w-9 h-9 rounded-full bg-brand-pink text-white text-xs font-medium flex items-center justify-center hover:bg-brand-pink-dark transition-colors shadow-sm"
                >
                  {getInitials(session.user?.name)}
                </button>

                {profileOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-20 w-52 bg-white rounded-2xl shadow-lg border border-neutral-100 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-medium text-brand-charcoal truncate">{session.user?.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-brand-pink-light hover:text-brand-pink transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/bookings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-brand-pink-light hover:text-brand-pink transition-colors"
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-brand-pink-light hover:text-brand-pink transition-colors"
                      >
                        Profile Settings
                      </Link>
                      {session.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-brand-pink-light hover:text-brand-pink transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-neutral-100 mt-1">
                        <button
                          onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/' }) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-neutral-500 hover:text-brand-pink transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-brand-pink text-white text-sm tracking-wide rounded-full hover:bg-brand-pink-dark transition-colors shadow-sm"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {isLoggedIn && (
            <button
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center text-neutral-500"
            >
              <BellIcon />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full ring-2 ring-white" />
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="flex flex-col gap-1.5 p-2"
          >
            <span className={`block w-5 h-0.5 bg-brand-charcoal transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-brand-charcoal transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-brand-charcoal transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-brand-pink-light px-6 py-5 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-neutral-600 hover:text-brand-pink transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-brand-pink-light flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 pb-1">
                  <div className="w-8 h-8 rounded-full bg-brand-pink text-white text-xs font-medium flex items-center justify-center shrink-0">
                    {getInitials(session.user?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-charcoal">{session.user?.name}</p>
                    <p className="text-xs text-neutral-400">{session.user?.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm text-neutral-600 hover:text-brand-pink transition-colors">Dashboard</Link>
                <Link href="/dashboard/bookings" onClick={() => setOpen(false)} className="text-sm text-neutral-600 hover:text-brand-pink transition-colors">My Bookings</Link>
                <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="text-sm text-neutral-600 hover:text-brand-pink transition-colors">Profile Settings</Link>
                {session.user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="text-sm text-neutral-600 hover:text-brand-pink transition-colors">Admin Panel</Link>
                )}
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="text-left text-sm text-rose-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:text-brand-pink transition-colors">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="inline-block px-5 py-2.5 bg-brand-pink text-white text-sm tracking-wide rounded-full text-center hover:bg-brand-pink-dark transition-colors">
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
