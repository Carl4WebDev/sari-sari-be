import express from "express";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import {
  getDashboard,
  getCalendarData,
  getCollectionStats,
  getCollectionTrend,
} from "./controller/DashboardController.js";

const router = express.Router();

router.get("/", authMiddleware, requireUser, getDashboard);
router.get("/calendar", authMiddleware, requireUser, getCalendarData);
router.get("/stats", authMiddleware, requireUser, getCollectionStats);
router.get("/trend", authMiddleware, requireUser, getCollectionTrend);

export default router;
