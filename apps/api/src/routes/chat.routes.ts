import { Router, type Router as ExpressRouter } from 'express'
import { chat } from '../controllers/chat.controller'

const router: ExpressRouter = Router()

router.post('/', chat)

export default router
