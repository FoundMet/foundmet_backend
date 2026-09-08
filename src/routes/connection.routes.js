import express from "express";
import {
  sendConnectionRequest,
  getMyConnections,
  respondConnectionRequest,
  removeConnection,
} from "../controllers/connection.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// All connection routes require authentication
router.use(verifyAuth);

/** POST /api/v1/connections/request/:userId */
router.post("/request/:userId", sendConnectionRequest);

/** GET /api/v1/connections */
router.get("/", getMyConnections);

/** PUT /api/v1/connections/:connectionId */
router.put("/:connectionId", respondConnectionRequest);

/** DELETE /api/v1/connections/:connectionId */
router.delete("/:connectionId", removeConnection);

export default router;
