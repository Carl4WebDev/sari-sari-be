import AppError from "../errors/AppError.js";

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    throw new AppError("You are not ADMIN", 403, "FORBIDDEN");
  }
  next();
};
