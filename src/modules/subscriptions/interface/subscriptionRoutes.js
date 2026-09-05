import express from "express";
import {
  getPlans,
  getCurrentSubscription,
  subscribe,
  cancelSubscription,
} from "./controller/SubscriptionController.js";
import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/current", authMiddleware, requireUser, getCurrentSubscription);
router.post("/subscribe", authMiddleware, requireUser, subscribe);
router.post("/cancel", authMiddleware, requireUser, cancelSubscription);

export default router;
