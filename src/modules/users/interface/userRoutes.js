import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateStoreName,
  changePassword,
} from "./Controller/UserController.js";

const router = express.Router();

import loginRateLimiter from "../../../core/middleware/LoginRateLimiter.js";
import authMiddleware from "../../../core/middleware/Auth.js";
import { requireUser } from "../../../core/middleware/requireUser.js";

router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);

router.get("/profile", authMiddleware, requireUser, getProfile);
router.patch(
  "/profile/store-name",
  authMiddleware,
  requireUser,
  updateStoreName,
);
router.patch("/profile/password", authMiddleware, requireUser, changePassword);

export default router;
