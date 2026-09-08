import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import { createUser } from '../controllers/auth.controller.js';


const router=express.Router();

/** POST /auth/create-account */
const upload=multer({storage:multer.memoryStorage()})
router.post('/create-account',upload.single("image"),createUser);


export default router;