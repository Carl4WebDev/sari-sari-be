import express from "express";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "./Controller/ProductController.js";

const router = express.Router();

router.post("/", authMiddleware, requireUser, createProduct);

router.get("/", authMiddleware, requireUser, getProducts);

router.put("/:id", authMiddleware, requireUser, updateProduct);

router.delete("/:id", authMiddleware, requireUser, deleteProduct);

export default router;
