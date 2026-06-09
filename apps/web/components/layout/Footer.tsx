import Link from 'next/link'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand column */}
          <div>
            <p className="font-serif text-xl tracking-[0.2em] uppercase text-brand-pink mb-3">
              Beauty Brand
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Nairobi&apos;s premier luxury hair and beauty salon. Every visit is a transformation.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5">Navigate</p>
            <nav className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-neutral-300 hover:text-brand-pink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5">Find Us</p>
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Nairobi, Kenya</p>
              <p>
                Mon – Sat: <span className="text-white">8:00 AM – 7:00 PM</span>
              </p>
              <p>
                Sun: <span className="text-white">10:00 AM – 5:00 PM</span>
              </p>
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-brand-pink hover:text-white transition-colors underline underline-offset-4"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Beauty Brand. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-xs text-neutral-500 hover:text-brand-pink transition-colors">
              Client Login
            </Link>
            <Link href="/register" className="text-xs text-neutral-500 hover:text-brand-pink transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
