import {loginController, registerController, refreshTokenController,refreshTokenController, getmeController } from '../controllers/authController.js';
import express from 'express';
import protect from '../middlewares/protect.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
const router = express.Router();

router.post('/login', validate(loginSchema), loginController);
router.post('/register', validate(registerSchema), registerController);
router.post('/refresh',protect, refreshTokenController);
router.get('/me', protect, getmeController);
router.post('/logout', protect, logoutController);

export default router;