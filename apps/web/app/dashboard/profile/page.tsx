'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PasswordInput from '@/components/ui/PasswordInput'

interface UserData {
  _id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [user, setUser] = useState<UserData | null>(null)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [profileError, setProfileError] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!session?.apiToken) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user)
        setProfileForm({ name: data.user.name, phone: data.user.phone })
      })
  }, [session?.apiToken])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileStatus('saving')
    setProfileError('')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.apiToken}`,
      },
      body: JSON.stringify(profileForm),
    })

    const data = await res.json()

    if (!res.ok) {
      setProfileError(data.error || 'Failed to update profile')
      setProfileStatus('error')
      return
    }

    setUser(data.user)
    setProfileStatus('success')
    setTimeout(() => setProfileStatus('idle'), 3000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordStatus('error')
      return
    }

    setPasswordStatus('saving')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.apiToken}`,
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setPasswordError(data.error || 'Failed to update password')
      setPasswordStatus('error')
      return
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordStatus('success')
    setTimeout(() => setPasswordStatus('idle'), 3000)
  }

  if (status === 'loading' || !user) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-pink border-t-transparent animate-spin" />
      </main>
    )
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-KE', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-brand-cream">
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-pink transition-colors mb-10"
        >
          ← Back to Dashboard
        </Link>

        {/* Avatar card */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-brand-pink flex items-center justify-center shrink-0">
            <span className="text-white font-serif text-2xl">{getInitials(user.name)}</span>
          </div>
          <div>
            <p className="font-serif text-2xl text-brand-charcoal">{user.name}</p>
            <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-block px-3 py-1 bg-brand-pink-light text-brand-pink text-xs tracking-wide rounded-full capitalize">
                {session?.user?.role}
              </span>
              <span className="text-xs text-neutral-400">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 mb-6">
          <h2 className="font-serif text-xl text-brand-charcoal mb-6">Personal Details</h2>

          {profileStatus === 'success' && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              Profile updated successfully.
            </div>
          )}
          {profileStatus === 'error' && (
            <div className="mb-5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
              {profileError}
            </div>
          )}

          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Email <span className="normal-case text-neutral-400">(cannot be changed)</span>
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-400 bg-neutral-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+254 7XX XXX XXX"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink transition-colors"
              />
              <p className="text-xs text-neutral-400 mt-1.5">Format: +254712345678</p>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={profileStatus === 'saving'}
                className="px-8 py-3 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-colors shadow-sm shadow-brand-pink/20 disabled:opacity-60"
              >
                {profileStatus === 'saving' ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8">
          <h2 className="font-serif text-xl text-brand-charcoal mb-6">Change Password</h2>

          {passwordStatus === 'success' && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              Password updated successfully.
            </div>
          )}
          {passwordStatus === 'error' && (
            <div className="mb-5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
              {passwordError}
            </div>
          )}

          <form onSubmit={savePassword} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Current Password
              </label>
              <PasswordInput
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                New Password
              </label>
              <PasswordInput
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-neutral-700 mb-2">
                Confirm New Password
              </label>
              <PasswordInput
                required
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                placeholder="••••••••"
                className={
                  passwordForm.confirmPassword &&
                  passwordForm.confirmPassword !== passwordForm.newPassword
                    ? 'border-rose-300 focus:border-rose-400'
                    : ''
                }
              />
              {passwordForm.confirmPassword &&
                passwordForm.confirmPassword !== passwordForm.newPassword && (
                  <p className="text-xs text-rose-500 mt-1.5">Passwords do not match</p>
                )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={
                  passwordStatus === 'saving' ||
                  (!!passwordForm.confirmPassword &&
                    passwordForm.confirmPassword !== passwordForm.newPassword)
                }
                className="px-8 py-3 bg-brand-charcoal text-white text-sm tracking-widest uppercase rounded-full hover:bg-neutral-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {passwordStatus === 'saving' ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  )
}
