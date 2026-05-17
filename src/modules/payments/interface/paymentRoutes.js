import express from "express";
import { createPayment } from "./controller/PaymentController.js";
import { requireUser } from "../../../core/middleware/requireUser.js";
import authMiddleware from "../../../core/middleware/Auth.js";

const router = express.Router();

router.post("/", authMiddleware, requireUser, createPayment);

export default router;
