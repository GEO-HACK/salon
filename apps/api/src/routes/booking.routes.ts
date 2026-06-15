import { Router, type Router as ExpressRouter } from 'express'
import {
  createBookingHandler,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  completeBooking,
} from '../controllers/booking.controller'
import { authenticate } from '../middleware/authenticate'
import { requireRole } from '../middleware/requireRole'

const router: ExpressRouter = Router()

router.post('/', authenticate, createBookingHandler)
router.get('/mine', authenticate, getMyBookings)
router.get('/', authenticate, requireRole('admin'), getAllBookings)
router.put('/:id/cancel', authenticate, cancelBooking)
router.put('/:id/complete', authenticate, requireRole('admin'), completeBooking)

export default router
