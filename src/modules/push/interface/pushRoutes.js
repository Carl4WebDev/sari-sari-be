import express from "express";
import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import { subscribe, unsubscribe, getVapidKey } from "./controller/PushController.js";

const router = express.Router();

router.get("/vapid-key", authMiddleware, requireUser, getVapidKey);
router.post("/subscribe", authMiddleware, requireUser, subscribe);
router.post("/unsubscribe", authMiddleware, requireUser, unsubscribe);

export default router;
