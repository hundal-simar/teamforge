import {loginController, registerController, refreshTokenController,refreshTokenController, getmeController } from '../controllers/authController.js';
import express from 'express';
import protect from '../middlewares/protect.js';
const router = express.Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/refresh',protect, refreshTokenController);
router.get('/me', protect, getmeController);
router.post('/logout', protect, logoutController);

export default router;