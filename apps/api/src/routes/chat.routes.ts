import { Router, type Router as ExpressRouter } from 'express'
import { chat } from '../controllers/chat.controller'
import { optionalAuth } from '../middleware/optionalAuth'

const router: ExpressRouter = Router()

router.post('/', optionalAuth, chat)

export default router
