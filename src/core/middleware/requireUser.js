import AppError from "../errors/AppError.js";

export const requireUser = (req, res, next) => {
  if (req.user?.role !== "USER") {
    throw new AppError("You are not USER", 403, "FORBIDDEN");
  }
  next();
};
