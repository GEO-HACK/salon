'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
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

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-brand-cream px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-10">
          <div className="text-center mb-8">
            <p className="font-serif text-3xl text-brand-charcoal mb-1">Welcome Back</p>
            <p className="text-sm text-neutral-600">Sign in to manage your bookings</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs tracking-widest uppercase text-neutral-700">
                  Password
                </label>
                <Link
                  href="/contact"
                  className="text-xs text-brand-pink hover:text-brand-pink-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-colors shadow-md shadow-brand-pink/20 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-600 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-pink hover:text-brand-pink-dark transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
