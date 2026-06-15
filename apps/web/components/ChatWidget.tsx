'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface BookingConfirmation {
  id: string
  clientName: string
  phone: string
  service: string
  price: number
  date: string
  time: string
}

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! 👋 I'm your Beauty Brand booking assistant. I can help you book any of our services — hair, nails, skincare, or makeup. What would you like to book today?",
}

export default function ChatWidget() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send the auth token when logged in so the booking links to the account
          ...(session?.apiToken ? { Authorization: `Bearer ${session.apiToken}` } : {}),
        },
        body: JSON.stringify({ messages: nextMessages }),
      })

      const data = await res.json()

      if (data.type === 'booking_confirmed') {
        setConfirmation(data.booking)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open booking assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-pink text-white rounded-full shadow-lg shadow-brand-pink/40 hover:bg-brand-pink-dark transition-all flex items-center justify-center"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[22rem] max-h-[34rem] flex flex-col bg-white rounded-3xl shadow-2xl shadow-black/15 border border-neutral-100 overflow-hidden">

          {/* Header */}
          <div className="bg-brand-pink px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-serif">
              BB
            </div>
            <div>
              <p className="text-white text-sm font-medium tracking-wide">Beauty Brand</p>
              <p className="text-white/70 text-xs">Book your appointment</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-pink text-white rounded-br-sm'
                      : 'bg-neutral-100 text-brand-charcoal rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Booking confirmation card */}
            {confirmation && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm">
                <p className="text-emerald-700 font-medium mb-2">✓ Booking Confirmed</p>
                <div className="space-y-1 text-neutral-600">
                  <p><span className="text-neutral-400">Name:</span> {confirmation.clientName}</p>
                  <p><span className="text-neutral-400">Service:</span> {confirmation.service}</p>
                  <p><span className="text-neutral-400">Date:</span> {confirmation.date}</p>
                  <p><span className="text-neutral-400">Time:</span> {confirmation.time}</p>
                  <p><span className="text-neutral-400">Price:</span> KES {confirmation.price.toLocaleString()}</p>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-4 py-3 border-t border-neutral-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={loading}
              className="flex-1 text-sm px-4 py-2.5 border border-neutral-200 rounded-full focus:outline-none focus:border-brand-pink transition-colors placeholder:text-neutral-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-brand-pink text-white rounded-full flex items-center justify-center hover:bg-brand-pink-dark transition-colors disabled:opacity-40 shrink-0"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
