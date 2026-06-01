import express from "express";
import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import {
  createReminder,
  getBorrowerReminders,
  getDashboardReminders,
  updateReminderStatus,
  remindAgain,
  deleteReminder,
} from "./controller/CollectionReminderController.js";

const router = express.Router();

const cache10s = (_req, res, next) => {
  res.set("Cache-Control", "private, max-age=10");
  next();
};

router.post("/", authMiddleware, requireUser, createReminder);

router.get("/dashboard", authMiddleware, requireUser, cache10s, getDashboardReminders);

router.get(
  "/borrower/:borrowerId",
  authMiddleware,
  requireUser,
  cache10s,
  getBorrowerReminders,
);

router.patch(
  "/:reminderId/status",
  authMiddleware,
  requireUser,
  updateReminderStatus,
);

router.post("/:reminderId/remind-again", authMiddleware, requireUser, remindAgain);

router.delete("/:reminderId", authMiddleware, requireUser, deleteReminder);

export default router;
