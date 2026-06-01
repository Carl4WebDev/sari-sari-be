import express from "express";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  archiveProduct,
  getArchivedProducts,
  reactivateProduct,
} from "./Controller/ProductController.js";

const router = express.Router();

// Short-lived cache for list endpoints — prevents redundant hits during navigation
const cache30s = (_req, res, next) => {
  res.set("Cache-Control", "private, max-age=30");
  next();
};

router.post("/", authMiddleware, requireUser, createProduct);

router.get("/", authMiddleware, requireUser, cache30s, getProducts);

router.put("/:id", authMiddleware, requireUser, updateProduct);

router.delete("/:id", authMiddleware, requireUser, deleteProduct);

router.get("/archived", authMiddleware, requireUser, cache30s, getArchivedProducts);

router.patch("/:id/archive", authMiddleware, requireUser, archiveProduct);

router.patch("/:id/reactivate", authMiddleware, requireUser, reactivateProduct);

export default router;
