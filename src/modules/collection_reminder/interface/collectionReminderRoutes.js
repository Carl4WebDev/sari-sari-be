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

router.post("/", authMiddleware, requireUser, createReminder);

router.get("/dashboard", authMiddleware, requireUser, getDashboardReminders);

router.get(
  "/borrower/:borrowerId",
  authMiddleware,
  requireUser,
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
