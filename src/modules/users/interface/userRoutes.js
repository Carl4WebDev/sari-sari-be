import express from "express";
import { register, login } from "./Controller/UserController.js";

const router = express.Router();

import loginRateLimiter from "../../../core/middleware/LoginRateLimiter.js";

router.post("/register", register);
router.post("/login", loginRateLimiter, login);

export default router;
