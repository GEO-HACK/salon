import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from './config/db'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import slotRoutes from './routes/slot.routes'
import bookingRoutes from './routes/booking.routes'
import chatRoutes from './routes/chat.routes'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'beauty-brand-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/slots', slotRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/chat', chatRoutes)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
