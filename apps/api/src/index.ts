import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'beauty-brand-api' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
