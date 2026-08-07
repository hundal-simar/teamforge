import express from 'express';
import { updateProfile, uploadAvatar } from '../controllers/userController.js';
import protect from '../middlewares/protect.js';
import upload from '../middlewares/upload.js';
import  validate  from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = express.Router();

router.patch('/me', protect, validate(updateProfileSchema), updateProfile);
router.post('/me/avatar', protect, upload.single('file'), uploadAvatar);

export default router;