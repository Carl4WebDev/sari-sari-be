import express from "express";
import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "./controller/ExpenseController.js";

const router = express.Router();

router.post("/", authMiddleware, requireUser, createExpense);
router.get("/", authMiddleware, requireUser, getExpenses);
router.put("/:id", authMiddleware, requireUser, updateExpense);
router.delete("/:id", authMiddleware, requireUser, deleteExpense);

export default router;
