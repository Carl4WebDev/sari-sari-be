import express from "express";
import publicRateLimiter from "../../../core/middleware/publicRateLimiter.js";
import { getPublicStatus } from "./Controller/PublicStatusController.js";

const router = express.Router();

router.get("/status/:token", publicRateLimiter, getPublicStatus);

export default router;
