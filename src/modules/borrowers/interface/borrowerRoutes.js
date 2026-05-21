import express from "express";
import {
  createBorrower,
  getBorrowers,
  getBorrowerTransactions,
  uploadBorrowerProfileImage,
} from "./Controller/BorrowerController.js";

import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

import { uploadBorrowerProfile } from "../../../core/middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireUser, createBorrower);

router.get("/", authMiddleware, requireUser, getBorrowers);
router.get(
  "/:id/transactions",
  authMiddleware,
  requireUser,
  getBorrowerTransactions,
);

router.patch(
  "/:borrowerId/profile-image",
  authMiddleware,
  requireUser,
  uploadBorrowerProfile.single("profile_image"),
  uploadBorrowerProfileImage,
);
export default router;
