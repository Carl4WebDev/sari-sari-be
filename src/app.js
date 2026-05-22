import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./modules/users/interface/userRoutes.js";
import errorHandler from "./core/middleware/errorHandler.js";
import healthRoute from "./core/http/healthRoutes.js";
import borrowerRoutes from "./modules/borrowers/interface/borrowerRoutes.js";
import loanRoutes from "./modules/loans/interface/loanRoutes.js";
import paymentRoutes from "./modules/payments/interface/paymentRoutes.js";

import productRoutes from "./modules/products/interface/productRoutes.js";

import publicStatusRoutes from "./modules/public_status/interface/publicStatusRoutes.js";

import dashboardRoutes from "./modules/dashboard/interface/dashboardRoutes.js";

dotenv.config();

const app = express();
export default app;

// 🔥 CORS goes here
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend port
    credentials: true,
  }),
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use(healthRoute);
app.use("/api/users", userRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/public", publicStatusRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);
