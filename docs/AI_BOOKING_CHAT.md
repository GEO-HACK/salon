# AI Booking Chat — Feature Guide

The chat widget lets any visitor (logged in or not) book an appointment by having a natural conversation with an AI assistant powered by **Google Gemini 1.5 Flash**.

---

## How It Works — End to End

```
Visitor types a message
        ↓
POST /api/chat  (Express)
        ↓
Gemini reads live services + slots from MongoDB
        ↓
   Enough info?
   ┌───────────────────────────────────┐
   │ NO → Gemini asks follow-up        │
   │ YES → Gemini calls create_booking │
   └───────────────────────────────────┘
        ↓
BookingService runs a MongoDB transaction
  (atomically marks slot as booked + creates Booking document)
        ↓
Response returned to ChatWidget
```

---

## The Chat Widget (Frontend)

The floating pink chat button appears on **every page** — bottom-right corner.

### User flow
1. Visitor clicks the chat button
2. AI greets them and asks what they'd like to book
3. Visitor describes what they want (e.g. *"I'd like a haircut on Friday"*)
4. AI asks for missing details one at a time:
   - Preferred service (from the live list)
   - Preferred date/time (from available slots)
   - Full name
   - Phone number (+254 format)
5. Once all details are collected, AI calls `create_booking` automatically
6. A green **Booking Confirmed** card appears in the chat with:
   - Client name
   - Service name
   - Date and time
   - Price (KES)

### Key behaviour
- The AI only offers **real slots** from the database — it cannot invent availability
- If a slot is taken between the AI collecting info and confirming, the visitor gets a polite message asking to pick another time (double-booking is prevented at the DB level with a MongoDB transaction)
- Works without login — guest bookings are stored with `guestName` and `guestPhone`

---

## Prerequisites — Data Must Exist First

The AI pulls live data from MongoDB on every request. If there are no services or slots, the AI will say nothing is available.

### 1. Add Services (admin only)

```http
POST /api/services
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Full Hair Treatment",
  "description": "Wash, cut and style",
  "price": 3500,
  "durationMinutes": 90,
  "category": "hair"
}
```

### 2. Add Time Slots (admin only)

```http
POST /api/slots
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "date": "2026-06-20",
  "startTime": "10:00",
  "endTime": "11:30"
}
```

Repeat for as many slots as needed. The AI shows the next **20 upcoming unbooked slots** in each conversation.

---

## API Reference

### `POST /api/chat`

Public endpoint — no authentication required.

**Request body**
```json
{
  "messages": [
    { "role": "user", "content": "I want to book a manicure" },
    { "role": "assistant", "content": "Sure! What date works for you?" },
    { "role": "user", "content": "This Saturday" }
  ]
}
```

The `messages` array is the full conversation history. The frontend sends every message each time (stateless on the server side).

**Response — normal message**
```json
{
  "type": "message",
  "message": "We have Saturday 20 June at 10:00 AM available. What's your full name?"
}
```

**Response — booking confirmed**
```json
{
  "type": "booking_confirmed",
  "message": "Your booking is confirmed, Jane! We'll send a WhatsApp confirmation to +254712345678 shortly.",
  "booking": {
    "id": "666abc...",
    "clientName": "Jane Doe",
    "phone": "+254712345678",
    "service": "Full Hair Treatment",
    "price": 3500,
    "date": "Saturday, 20 June",
    "time": "10:00"
  }
}
```

**Response — slot taken**
```json
{
  "type": "message",
  "message": "I'm sorry, that slot was just taken by another client! Let me check what else is available for you."
}
```

---

## Environment Variable

In `apps/api/.env`:

```env
GEMINI_API_KEY=your_key_here
```

Get a free key at **aistudio.google.com** → Get API Key. No credit card required.

**Free tier limits (Gemini 1.5 Flash):**
- 15 requests per minute
- 1,000,000 tokens per day
- More than sufficient for a salon

---

## Viewing Bookings

**Client (logged in):** Dashboard → My Bookings  
Shows all their appointments with status, date/time, price, and a Cancel button.

**Admin (Phase 6):** Admin panel will show all bookings across all clients.

---

## Files

| File | Purpose |
|---|---|
| `apps/web/components/ChatWidget.tsx` | Floating chat UI |
| `apps/api/src/services/AIService.ts` | Gemini integration + tool definition |
| `apps/api/src/services/BookingService.ts` | MongoDB transaction for booking creation |
| `apps/api/src/controllers/chat.controller.ts` | Handles `/api/chat` — bridges AI ↔ BookingService |
| `apps/web/app/dashboard/bookings/page.tsx` | Client bookings view |
