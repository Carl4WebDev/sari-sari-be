import express from "express";

import authMiddleware from "../../../core/middleware/Auth.js";

import { getDashboard } from "./controller/DashboardController.js";

const router = express.Router();

router.get("/", authMiddleware, getDashboard);

export default router;
