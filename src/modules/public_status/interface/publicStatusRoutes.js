import express from "express";
import { getPublicStatus } from "./Controller/PublicStatusController.js";

const router = express.Router();

router.get("/status/:token", getPublicStatus);

export default router;
