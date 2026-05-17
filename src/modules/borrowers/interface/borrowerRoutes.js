import express from "express";
import {
  createBorrower,
  getBorrowers,
  getBorrowerTransactions,
} from "./Controller/BorrowerController.js";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

const router = express.Router();

router.post("/", authMiddleware, requireUser, createBorrower);

router.get("/", authMiddleware, requireUser, getBorrowers);
router.get(
  "/:id/transactions",
  authMiddleware,
  requireUser,
  getBorrowerTransactions,
);

export default router;
