import type { Request, Response } from 'express'
import { CreateSlotSchema } from '@beauty-brand/shared'
import { Slot } from '../models/Slot.model'

export async function getSlots(req: Request, res: Response) {
  const { date } = req.query
  const filter: any = { isBlocked: false }

  if (date && typeof date === 'string') {
    const start = new Date(date)
    const end = new Date(date)
    end.setDate(end.getDate() + 1)
    filter.date = { $gte: start, $lt: end }
  } else {
    filter.date = { $gte: new Date() }
  }

  const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 }).lean()
  return res.json({ slots })
}

export async function createSlot(req: Request, res: Response) {
  const result = CreateSlotSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }
  const { date, startTime, endTime } = result.data
  const slot = await Slot.create({ date: new Date(date), startTime, endTime })
  return res.status(201).json({ slot })
}

export async function blockSlot(req: Request, res: Response) {
  const slot = await Slot.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  ).lean()
  if (!slot) return res.status(404).json({ error: 'Slot not found' })
  return res.json({ slot })
}

export async function unblockSlot(req: Request, res: Response) {
  const slot = await Slot.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  ).lean()
  if (!slot) return res.status(404).json({ error: 'Slot not found' })
  return res.json({ slot })
}
