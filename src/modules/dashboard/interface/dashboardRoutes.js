import express from "express";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import {
  getDashboard,
  getCalendarData,
  getCollectionStats,
  getCollectionTrend,
  getIncomeSummary,
  getToday,
} from "./controller/DashboardController.js";

const router = express.Router();

const cache10s = (_req, res, next) => {
  res.set("Cache-Control", "private, max-age=10");
  next();
};

router.get("/", authMiddleware, requireUser, cache10s, getDashboard);
router.get("/calendar", authMiddleware, requireUser, cache10s, getCalendarData);
router.get("/stats", authMiddleware, requireUser, cache10s, getCollectionStats);
router.get("/trend", authMiddleware, requireUser, cache10s, getCollectionTrend);
router.get("/income", authMiddleware, requireUser, cache10s, getIncomeSummary);
router.get("/today", authMiddleware, requireUser, cache10s, getToday);

export default router;
