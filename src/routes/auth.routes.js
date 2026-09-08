import express from 'express';
import multer from 'multer';
import { createUser, loginUser, getMe } from '../controllers/auth.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/** POST /auth/create-account */
const upload = multer({ storage: multer.memoryStorage() });
router.post('/create-account', upload.single("image"), createUser);

/** POST /auth/login */
router.post('/login', loginUser);

/** GET /auth/me */
router.get('/me', verifyAuth, getMe);

export default router;