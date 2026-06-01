import express from "express";
import publicRateLimiter from "../../../core/middleware/publicRateLimiter.js";
import { getPublicStatus } from "./controller/PublicStatusController.js";

const router = express.Router();

router.get("/status/:token", publicRateLimiter, (_req, res, next) => {
  res.set("Cache-Control", "private, max-age=10");
  next();
}, getPublicStatus);

export default router;
