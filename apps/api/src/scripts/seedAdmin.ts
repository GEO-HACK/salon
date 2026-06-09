import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.model'
import { UserRole } from '../models/UserRole.model'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function seedAdmin() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const phone = process.env.ADMIN_PHONE
  const name = 'Salon Admin'

  if (!email || !password || !phone) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_PHONE must be set in .env')
  }

  const existing = await User.findOne({ email }).lean()
  if (existing) {
    console.log('Admin already exists:', email)
    await mongoose.disconnect()
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await User.create({ name, email, passwordHash, phone })
  await UserRole.create({ userId: admin._id, role: 'admin', assignedBy: 'system' })

  console.log('Admin created:', email)
  await mongoose.disconnect()
}

seedAdmin().catch((err) => {
  console.error(err)
  process.exit(1)
})
