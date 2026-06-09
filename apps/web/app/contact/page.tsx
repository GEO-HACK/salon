'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire to contact API in a later phase
    setSent(true)
  }

  return (
    <main>
      {/* Header */}
      <section className="bg-brand-pink-light py-20 text-center">
        <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">Get In Touch</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-charcoal">Contact Us</h1>
        <p className="mt-4 text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
          Have a question or want to enquire before booking? We&apos;re happy to help.
        </p>
      </section>

      {/* Content */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* Form */}
          <div>
            <h2 className="font-serif text-2xl text-brand-charcoal mb-8">Send a Message</h2>

            {sent ? (
              <div className="bg-brand-pink-light border border-brand-pink/20 rounded-2xl p-8 text-center">
                <p className="font-serif text-xl text-brand-charcoal mb-2">Message Received!</p>
                <p className="text-sm text-neutral-500">
                  We&apos;ll get back to you within a few hours on WhatsApp or email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Amina Wanjiru"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-300 focus:outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-300 focus:outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-300 focus:outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-300 focus:outline-none focus:border-brand-pink transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-colors shadow-md shadow-brand-pink/20"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Visit Us</h2>
              <div className="space-y-4 text-sm text-neutral-500">
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-300 mb-1">Location</p>
                  <p className="text-brand-charcoal">Nairobi, Kenya</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-300 mb-1">Hours</p>
                  <p>Mon – Sat: 8:00 AM – 7:00 PM</p>
                  <p>Sunday: 10:00 AM – 5:00 PM</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-300 mb-1">WhatsApp</p>
                  <a
                    href="https://wa.me/254700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-pink hover:text-brand-pink-dark transition-colors underline underline-offset-4"
                  >
                    +254 700 000 000
                  </a>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-brand-pink-light rounded-2xl h-52 flex items-center justify-center">
              <p className="text-xs text-neutral-400 tracking-wide">Map — coming soon</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
