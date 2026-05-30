import express from "express";
import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";
import { smsRateLimiter } from "../../../core/middleware/smsRateLimiter.js";

import { sendReminderSms } from "./controller/SmsController.js";

const router = express.Router();

router.post(
  "/send",
  authMiddleware,
  requireUser,
  smsRateLimiter,
  sendReminderSms,
);

export default router;
