import express from 'express'
import { handleNewUser } from '../controllers/registerController.js'
import { createUserSchema, validateBody } from '../validation/validations.js'

const router = express.Router();
router.post('/', validateBody(createUserSchema), handleNewUser);

export default router;