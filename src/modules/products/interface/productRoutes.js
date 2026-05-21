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

router.post("/", authMiddleware, requireUser, createProduct);

router.get("/", authMiddleware, requireUser, getProducts);

router.put("/:id", authMiddleware, requireUser, updateProduct);

router.delete("/:id", authMiddleware, requireUser, deleteProduct);

router.get("/archived", authMiddleware, requireUser, getArchivedProducts);

router.patch("/:id/archive", authMiddleware, requireUser, archiveProduct);

router.patch("/:id/reactivate", authMiddleware, requireUser, reactivateProduct);

export default router;
