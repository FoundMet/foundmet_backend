import express from 'express';
import { Router } from 'express';

import { allUsers } from '../controllers/auth.controller.js';


const router=express.Router();

/** GET /api/v1/users */
router.get("/users",allUsers);

export default router;