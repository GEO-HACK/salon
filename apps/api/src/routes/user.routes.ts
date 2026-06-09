import { Router, type Router as ExpressRouter } from 'express'
import { updateProfile, changePassword } from '../controllers/user.controller'
import { authenticate } from '../middleware/authenticate'

const router: ExpressRouter = Router()

router.put('/profile', authenticate, updateProfile)
router.put('/password', authenticate, changePassword)

export default router
