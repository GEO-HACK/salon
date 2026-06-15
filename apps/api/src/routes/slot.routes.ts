import { Router, type Router as ExpressRouter } from 'express'
import { getSlots, createSlot, blockSlot, unblockSlot } from '../controllers/slot.controller'
import { authenticate } from '../middleware/authenticate'
import { requireRole } from '../middleware/requireRole'

const router: ExpressRouter = Router()

router.get('/', getSlots)
router.post('/', authenticate, requireRole('admin'), createSlot)
router.put('/:id/block', authenticate, requireRole('admin'), blockSlot)
router.put('/:id/unblock', authenticate, requireRole('admin'), unblockSlot)

export default router
