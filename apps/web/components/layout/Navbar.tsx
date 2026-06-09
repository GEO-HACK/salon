'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

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
        <div className="hidden md:flex items-center gap-4">
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
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span
            className={`block w-5 h-0.5 bg-brand-charcoal transition-all duration-200 ${
              open ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-brand-charcoal transition-all duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-brand-charcoal transition-all duration-200 ${
              open ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
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
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-500 hover:text-brand-pink transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="inline-block px-5 py-2.5 bg-brand-pink text-white text-sm tracking-wide rounded-full text-center hover:bg-brand-pink-dark transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
