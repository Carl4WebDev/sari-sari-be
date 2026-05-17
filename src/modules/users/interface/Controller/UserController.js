import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";
import UserRepo from "../../infrastructure/UserRepo.js";
import AuthService from "../../application/AuthService.js";
import AuthTokenService from "../../../../core/middleware/AuthTokenService.js";

const userRepository = new UserRepo();
const tokenService = new AuthTokenService();
const authService = new AuthService(userRepository, tokenService);

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
});
