import express from "express";
import {
  rateFounder,
  getFounderRatings,
} from "../controllers/rating.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/** GET /api/v1/ratings/:userId - Public: view founder ratings */
router.get("/:userId", getFounderRatings);

/** POST /api/v1/ratings/:userId - Protected: rate a founder */
router.post("/:userId", verifyAuth, rateFounder);

export default router;
