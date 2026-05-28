import express from "express";
import {
  createBorrower,
  getBorrowers,
  getBorrowerTransactions,
  uploadBorrowerProfileImage,
  updateBorrower,
  // updatePublicAccess,
  updatePublicLoanAccess,
  archiveBorrower,
  getArchivedBorrowers,
  reactivateBorrower,
  createBorrowerNote,
  getBorrowerNotes,
  updateBorrowerNote,
  deleteBorrowerNote,
} from "./controller/BorrowerController.js";

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

router.get("/:borrowerId/notes", authMiddleware, requireUser, getBorrowerNotes);

router.post(
  "/:borrowerId/notes",
  authMiddleware,
  requireUser,
  createBorrowerNote,
);

router.patch(
  "/:borrowerId/notes/:noteId",
  authMiddleware,
  requireUser,
  updateBorrowerNote,
);

router.delete(
  "/:borrowerId/notes/:noteId",
  authMiddleware,
  requireUser,
  deleteBorrowerNote,
);

// Must be last — /:id would match more specific paths above
router.patch("/:id", authMiddleware, requireUser, updateBorrower);

export default router;
