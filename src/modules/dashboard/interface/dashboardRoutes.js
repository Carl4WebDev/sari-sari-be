import express from "express";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import { getDashboard } from "./controller/DashboardController.js";

const router = express.Router();

router.get("/", authMiddleware, requireUser, getDashboard);

export default router;
