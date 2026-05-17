import express from "express";
import authMiddleware from "../../../core/middleware/Auth.js";
import { createLoan } from "./Controller/LoanController.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

const router = express.Router();

router.post("/", authMiddleware, requireUser, createLoan);

export default router;
