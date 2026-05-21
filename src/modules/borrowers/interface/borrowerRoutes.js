import express from "express";
import {
  createBorrower,
  getBorrowers,
  getBorrowerTransactions,
  uploadBorrowerProfileImage,
  // updatePublicAccess,
  updatePublicLoanAccess,
  archiveBorrower,
  getArchivedBorrowers,
  reactivateBorrower,
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

// router.patch(
//   "/:id/public-access",
//   authMiddleware,
//   requireUser,
//   updatePublicAccess,
// );

router.patch(
  "/:id/public-access",
  authMiddleware,
  requireUser,
  updatePublicLoanAccess,
);

router.patch("/:id/archive", authMiddleware, requireUser, archiveBorrower);

router.get("/archived", authMiddleware, requireUser, getArchivedBorrowers);

router.patch(
  "/:id/reactivate",
  authMiddleware,
  requireUser,
  reactivateBorrower,
);
export default router;
