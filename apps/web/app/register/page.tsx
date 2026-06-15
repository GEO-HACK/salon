'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PasswordInput from '@/components/ui/PasswordInput'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign-in failed. Please log in manually.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-brand-cream px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-10">
          <div className="text-center mb-8">
            <p className="font-serif text-3xl text-brand-charcoal mb-1">Create Account</p>
            <p className="text-sm text-neutral-600">Join us and start booking your appointments</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                value={form.name}
                onChange={handleChange}
                placeholder="Amina Wanjiru"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+254 7XX XXX XXX"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Password
              </label>
              <PasswordInput
                name="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-colors shadow-md shadow-brand-pink/20 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-600 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-pink hover:text-brand-pink-dark transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
