import express from 'express'
import { handleLogin } from '../controllers/authController.js'
import { createUserSchema, validateBody } from '../validation/validations.js'

const router = express.Router();
router.post('/', validateBody(createUserSchema), handleLogin);

export default router;