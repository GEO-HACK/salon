import { webcrypto } from 'crypto'
// ts-node-dev's worker process doesn't always expose the global `crypto`
// that the MongoDB driver requires — polyfill it before connecting.
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto

import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { Service } from '../models/Service.model'
import { Slot } from '../models/Slot.model'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const SERVICES = [
  { name: 'Signature Haircut & Style', description: 'Precision cut and blow-dry for all hair types.', price: 2500, durationMinutes: 60 },
  { name: 'Hair Colour & Treatment', description: 'Full colour with a nourishing bond treatment.', price: 6500, durationMinutes: 120 },
  { name: "Men's Grooming & Beard Trim", description: 'Sharp cut, beard shaping and hot towel finish.', price: 1800, durationMinutes: 45 },
  { name: 'Gel Manicure', description: 'Long-lasting gel polish with cuticle care.', price: 2000, durationMinutes: 60 },
  { name: 'Luxury Pedicure', description: 'Soak, scrub, massage and polish.', price: 2800, durationMinutes: 75 },
  { name: 'Facial & Skincare', description: 'Deep-cleanse facial tailored to your skin.', price: 4500, durationMinutes: 90 },
  { name: 'Makeup Application', description: 'Professional makeup for any occasion.', price: 3500, durationMinutes: 60 },
]

// Time slots offered each working day
const DAILY_TIMES = [
  { startTime: '09:00', endTime: '10:30' },
  { startTime: '11:00', endTime: '12:30' },
  { startTime: '13:30', endTime: '15:00' },
  { startTime: '15:30', endTime: '17:00' },
]

const DAYS_AHEAD = 14

async function seedCatalog() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  // Services — only seed if empty so we don't create duplicates
  const serviceCount = await Service.countDocuments()
  if (serviceCount === 0) {
    await Service.insertMany(SERVICES)
    console.log(`Seeded ${SERVICES.length} services`)
  } else {
    console.log(`Services already exist (${serviceCount}) — skipping`)
  }

  // Slots — create upcoming slots for the next DAYS_AHEAD days, skipping Sundays
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slotsToCreate: { date: Date; startTime: string; endTime: string }[] = []
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    if (date.getDay() === 0) continue // closed on Sundays

    for (const time of DAILY_TIMES) {
      slotsToCreate.push({ date, startTime: time.startTime, endTime: time.endTime })
    }
  }

  // Skip slots that already exist (same date + startTime)
  let created = 0
  for (const slot of slotsToCreate) {
    const exists = await Slot.findOne({ date: slot.date, startTime: slot.startTime }).lean()
    if (!exists) {
      await Slot.create(slot)
      created++
    }
  }
  console.log(`Seeded ${created} new slots (${slotsToCreate.length - created} already existed)`)

  await mongoose.disconnect()
  console.log('Done')
}

seedCatalog().catch((err) => {
  console.error(err)
  process.exit(1)
})
