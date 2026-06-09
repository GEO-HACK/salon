# Salon Beauty Brand — Project Constitution

> This document is the single source of truth for the entire project.
> Claude must read this file at the start of every session before writing any code.
> Never deviate from the architecture, naming conventions, or phase boundaries defined here.

---

## Project Identity

| Key | Value |
|---|---|
| Project name | Beauty Brand Salon Management System |
| Client | Luxury hair and beauty salon, Nairobi Kenya |
| Stack | Next.js 14 + Express.js monorepo |
| Repo structure | pnpm workspaces + Turborepo |
| Primary market | Kenya (mobile-first, WhatsApp-native) |
| Portfolio role | Real client deliverable + developer portfolio piece |

---

## Monorepo Structure

```
beauty-brand/
├── apps/
│   ├── web/                        ← Next.js 14 (App Router), TypeScript
│   └── api/                        ← Express.js, TypeScript
├── packages/
│   └── shared/                     ← Zod validators + TypeScript interfaces
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Tech Stack — Locked. Do Not Substitute.

### Frontend — apps/web
| Concern | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Animation | Framer Motion |
| Auth (client) | NextAuth.js v5 |
| Forms | React Hook Form + Zod |
| State | React Context (no Redux) |
| HTTP | Native fetch with typed helpers in lib/api.ts |

### Backend — apps/api
| Concern | Library |
|---|---|
| Framework | Express.js |
| Language | TypeScript (strict mode) |
| Database ORM | Mongoose (MongoDB) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod (shared from packages/shared) |
| AI | Anthropic Claude API — claude-sonnet-4-20250514 |
| WhatsApp | Meta Cloud API (WhatsApp Business) |
| Scheduler | node-cron |
| Email (fallback) | Nodemailer / Brevo |

### Shared — packages/shared
| Concern | Detail |
|---|---|
| Types | TypeScript interfaces for all entities |
| Validators | Zod schemas consumed by both apps |
| Constants | Enums: roles, booking status, notification types |

---

## Data Models — Authoritative Schema

### User
```typescript
{
  _id: ObjectId
  name: string
  email: string           // unique, indexed
  passwordHash: string    // bcrypt, never returned in API responses
  phone: string           // E.164 format e.g. +254712345678
  createdAt: Date
}
```

### UserRole  ← SEPARATE from User (security requirement)
```typescript
{
  _id: ObjectId
  userId: ObjectId        // ref: User
  role: 'client' | 'admin'
  assignedBy: string      // 'system' | admin userId
  assignedAt: Date
}
```

### Service
```typescript
{
  _id: ObjectId
  name: string
  description: string
  price: number           // KES
  durationMinutes: number
  imageUrl: string
  isActive: boolean       // soft delete pattern
  createdAt: Date
}
```

### Slot
```typescript
{
  _id: ObjectId
  date: Date
  startTime: string       // "09:00"
  endTime: string         // "11:00"
  isBooked: boolean
  isBlocked: boolean      // admin manually blocked
  createdAt: Date
}
```

### Booking
```typescript
{
  _id: ObjectId
  userId: ObjectId        // ref: User
  serviceId: ObjectId     // ref: Service
  slotId: ObjectId        // ref: Slot
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  whatsappSent: boolean
  reminderSent: boolean
  notes: string
  createdAt: Date
}
```

### NotificationLog
```typescript
{
  _id: ObjectId
  bookingId: ObjectId     // ref: Booking
  type: 'confirmation' | 'reminder' | 'admin_alert'
  sentAt: Date
  status: 'sent' | 'failed'
  phoneNumber: string
  errorMessage?: string   // populated on failure
}
```

---

## Security Architecture — Non-Negotiable

1. **Role is never on the User model.** UserRole is a separate collection.
2. **RegisterSchema (Zod) has no role field.** Role is hardcoded to 'client' in the controller.
3. **req.body is never trusted for role assignment.** Destructure only expected fields.
4. **authenticate middleware does a fresh DB lookup** of UserRole on every request — JWT role claim is not trusted alone.
5. **requireRole is a factory:** `requireRole('admin')` returns Express middleware.
6. **First admin is seeded via script** — no registration path leads to admin.
7. **Passwords are hashed with bcrypt (12 rounds)** — never stored or returned in plaintext.
8. **JWT secret is from environment variable** — never hardcoded.
9. **All admin routes are double-protected:** authenticate + requireRole('admin').
10. **Double-booking is prevented at the service layer** with a DB transaction — two simultaneous requests cannot book the same slot.

---

## API Contract — Complete Route Map

### Auth
```
POST   /api/auth/register         public
POST   /api/auth/login            public
GET    /api/auth/me               authenticate
```

### Services
```
GET    /api/services              public
POST   /api/services              authenticate + requireRole('admin')
PUT    /api/services/:id          authenticate + requireRole('admin')
DELETE /api/services/:id          authenticate + requireRole('admin')
```

### Slots
```
GET    /api/slots?date=YYYY-MM-DD public
POST   /api/slots                 authenticate + requireRole('admin')
PUT    /api/slots/:id/block       authenticate + requireRole('admin')
PUT    /api/slots/:id/unblock     authenticate + requireRole('admin')
```

### Bookings
```
POST   /api/bookings              authenticate
GET    /api/bookings/mine         authenticate
GET    /api/bookings              authenticate + requireRole('admin')
PUT    /api/bookings/:id/cancel   authenticate
PUT    /api/bookings/:id/complete authenticate + requireRole('admin')
```

### AI Chat
```
POST   /api/chat                  public
```

### WhatsApp
```
GET    /api/whatsapp/webhook      public  ← Meta verification handshake
POST   /api/whatsapp/webhook      public  ← incoming messages (CANCEL reply etc.)
```

---

## AI Agent Design

### Model
`claude-sonnet-4-20250514` — called server-side from Express only. Never called from the browser.

### Chat endpoint behaviour
1. Frontend sends `POST /api/chat` with `{ messages: ConversationMessage[] }`
2. Express builds system prompt (injecting live slot data for the requested date)
3. Claude responds — either with a text message OR a `create_booking` tool call
4. If tool call: Express writes booking to DB, triggers WhatsApp, returns confirmation
5. Response streamed back to frontend

### System prompt structure
```
You are a booking assistant for [Salon Name], a luxury hair and beauty salon in Nairobi.

Your ONLY job is to help clients book appointments.

Current services:
{INJECTED_FROM_DB}

Rules:
- Only offer slots that are actually available (injected below)
- Never fabricate availability
- Collect: full name, service, date, time, phone number
- Once all 5 are collected, call the create_booking tool
- Stay on topic — do not answer unrelated questions

Available slots for requested date:
{INJECTED_FROM_DB}
```

### Tool: create_booking
```typescript
{
  name: 'create_booking',
  description: 'Creates a confirmed booking when all client details are collected',
  input_schema: {
    type: 'object',
    properties: {
      clientName: { type: 'string' },
      phone: { type: 'string' },
      serviceId: { type: 'string' },
      slotId: { type: 'string' }
    },
    required: ['clientName', 'phone', 'serviceId', 'slotId']
  }
}
```

---

## WhatsApp Integration

### Provider
Meta Cloud API (primary). Twilio as fallback if Meta onboarding is delayed.

### Approved Message Templates

**confirmation**
```
Hello {{1}}, your appointment is confirmed!
Service: {{2}}
Date: {{3}} at {{4}}
Reply CANCEL to cancel. See you soon! 💅
```

**reminder** (sent 24hrs before via cron)
```
Hi {{1}}, reminder about your appointment tomorrow.
Service: {{2}} at {{3}}
See you then! 💅
```

**admin_alert**
```
New booking!
Client: {{1}} | {{2}}
Service: {{3}}
Date: {{4}} at {{5}}
```

### Cron job
Runs every hour via node-cron. Queries bookings where:
- status = 'confirmed'
- reminderSent = false
- slot date = tomorrow

---

## Frontend Pages

| Page | Route | Auth |
|---|---|---|
| Homepage | `/` | Public |
| Services | `/services` | Public |
| Gallery | `/gallery` | Public |
| Contact | `/contact` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Client dashboard | `/dashboard` | client |
| My bookings | `/dashboard/bookings` | client |
| Admin overview | `/admin` | admin |
| Admin — all bookings | `/admin/bookings` | admin |
| Admin — slot manager | `/admin/slots` | admin |
| Admin — services | `/admin/services` | admin |

---

## Environment Variables

### apps/api/.env
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d

ANTHROPIC_API_KEY=

META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=
META_VERIFY_TOKEN=

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_PHONE=

NODE_ENV=development
```

### apps/web/.env.local
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Build Phases — Authoritative Execution Order

Claude must complete each phase fully before starting the next.
Never skip ahead. Never mix phases.

---

### Phase 0 — Project Initialization ✦ START HERE

**Goal:** Monorepo boots, both dev servers run, no errors.

Tasks:
- [ ] Init pnpm workspace with turbo.json
- [ ] Scaffold apps/web (Next.js 14, TypeScript, Tailwind)
- [ ] Scaffold apps/api (Express, TypeScript)
- [ ] Scaffold packages/shared (TypeScript, Zod)
- [ ] Configure tsconfig references across all packages
- [ ] Write all package.json files with correct workspace references
- [ ] Write .env.example for apps/api
- [ ] Write .env.local.example for apps/web
- [ ] Verify: `pnpm install` runs cleanly from root
- [ ] Verify: `pnpm dev` starts both servers without error

Deliverable: Running monorepo skeleton. Both servers respond to a health check.

---

### Phase 1 — Database Models + Shared Types

**Goal:** All Mongoose models defined. All Zod validators written. Shared types exported.

Tasks:
- [ ] Write all TypeScript interfaces in packages/shared/types/
- [ ] Write all Zod validators in packages/shared/validators/
  - RegisterSchema has NO role field
  - BookingSchema validated server-side
- [ ] Write all Mongoose models in apps/api/src/models/
  - User.model.ts
  - UserRole.model.ts (separate from User)
  - Service.model.ts
  - Slot.model.ts
  - Booking.model.ts
  - NotificationLog.model.ts
- [ ] Configure Mongoose connection in apps/api/src/config/db.ts
- [ ] Write seedAdmin.ts script in apps/api/src/scripts/

Deliverable: `pnpm --filter api ts-check` passes. DB connects and seed script runs.

---

### Phase 2 — Authentication

**Goal:** Register, login, and protected routes work end to end.

Tasks:
- [ ] Build auth.controller.ts
  - register: destructure only name/email/password/phone — role hardcoded to 'client'
  - login: verify password, issue JWT, return user without passwordHash
  - me: return current user from DB
- [ ] Build authenticate.ts middleware (fresh DB role lookup)
- [ ] Build requireRole.ts middleware factory
- [ ] Build auth.routes.ts and wire to Express
- [ ] Configure NextAuth.js in apps/web/lib/auth.ts
  - Two roles: client | admin
  - Custom credentials provider hitting Express /api/auth/login
- [ ] Write middleware.ts in apps/web (protect /dashboard and /admin routes)
- [ ] Build login page UI
- [ ] Build register page UI

Deliverable: Can register as client, login, access /dashboard. Admin cannot be self-registered.

---

### Phase 3 — Public Frontend

**Goal:** Brand website is live with all public pages.

Tasks:
- [ ] Root layout with Navbar + Footer
- [ ] Homepage — hero, services preview, testimonials, CTA
- [ ] Services page — full service cards with pricing
- [ ] Gallery page — image grid (luxury aesthetic)
- [ ] Contact page — form + location
- [ ] Global styling — luxury color palette, typography, animations
- [ ] Mobile-first responsive on all pages
- [ ] Image optimization with next/image

Deliverable: Full public site running at localhost:3000 — looks premium.

---

### Phase 4 — Booking System + AI Agent

**Goal:** Client can complete a full booking through the AI chat widget.

Tasks:
- [ ] Build BookingService.ts (double-booking prevention with DB transaction)
- [ ] Build all booking routes and controllers
- [ ] Build all slot routes and controllers
- [ ] Build AIService.ts (Claude API integration)
  - System prompt construction with live DB data injection
  - create_booking tool definition and handler
- [ ] Build chat.controller.ts (handles tool call interception)
- [ ] Build ChatWidget.tsx on frontend
  - Floating chat button
  - Conversation UI
  - Connects to POST /api/chat
  - Renders booking confirmation on success
- [ ] Build client dashboard — view/cancel own bookings

Deliverable: Full AI booking flow works. Booking written to DB on completion.

---

### Phase 5 — WhatsApp Notifications

**Goal:** Every booking confirmation and reminder fires via WhatsApp.

Tasks:
- [ ] Register Meta Cloud API app and WhatsApp Business number
- [ ] Submit all 3 message templates for Meta approval
- [ ] Build WhatsAppService.ts
  - sendConfirmation(booking)
  - sendReminder(booking)
  - sendAdminAlert(booking)
- [ ] Wire WhatsAppService into BookingService (called after successful booking write)
- [ ] Build whatsapp.routes.ts
  - GET /webhook — Meta verification handshake
  - POST /webhook — handle incoming CANCEL replies
- [ ] Build reminderJob.ts (node-cron, runs hourly)
- [ ] Build NotificationLog write on every WhatsApp send attempt
- [ ] Test: end-to-end booking → WhatsApp message received

Deliverable: Booking confirmation arrives on WhatsApp within 10 seconds of booking.

---

### Phase 6 — Admin Dashboard

**Goal:** Admin can fully manage the salon from their dashboard.

Tasks:
- [ ] Admin overview page (today's bookings, stats)
- [ ] Admin bookings page (all bookings, filterable by date/status)
- [ ] Admin slot manager (create slots, block/unblock dates)
- [ ] Admin services manager (add/edit/deactivate services)
- [ ] Booking status actions (mark complete, cancel)
- [ ] Role guard verified on all admin API routes

Deliverable: Admin can run the salon entirely from the dashboard.

---

### Phase 7 — Payments (Paystack)

**Goal:** Client pays at booking confirmation.

Tasks:
- [ ] Integrate Paystack (Kenya card + M-Pesa support)
- [ ] Payment intent created when booking is initiated
- [ ] Booking status = 'pending' until payment confirmed
- [ ] Booking status = 'confirmed' + WhatsApp sent on payment success
- [ ] Paystack webhook handler for async payment events
- [ ] Admin can see payment status per booking

Deliverable: No booking is confirmed without payment.

---

### Phase 8 — Deployment

**Goal:** Live on production URLs.

Tasks:
- [ ] Deploy apps/api to Railway (or Render)
- [ ] Deploy apps/web to Vercel
- [ ] Configure production environment variables
- [ ] Set up MongoDB Atlas (production DB)
- [ ] Configure Meta WhatsApp webhook to production URL
- [ ] Run seedAdmin.ts against production DB
- [ ] Smoke test full booking flow on production

Deliverable: Live at client domain. Full flow verified on production.

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Files | kebab-case | `booking.controller.ts` |
| React components | PascalCase | `ChatWidget.tsx` |
| Variables/functions | camelCase | `createBooking()` |
| DB collections | PascalCase | `UserRole` |
| Env variables | SCREAMING_SNAKE | `ANTHROPIC_API_KEY` |
| API routes | kebab-case | `/api/booking-slots` |
| Zod schemas | PascalCase + Schema | `RegisterSchema` |

---

## Claude Session Instructions

At the start of every new session:
1. Read this CONSTITUTION.md fully before writing any code
2. Identify the current phase from the task checklist
3. Complete only tasks within the current phase
4. Do not start Phase N+1 until all Phase N tasks are checked off
5. After completing a task, check it off in the checklist
6. If an architectural decision conflicts with this document, flag it and ask before proceeding
7. Never add dependencies not listed in the Tech Stack section without asking first