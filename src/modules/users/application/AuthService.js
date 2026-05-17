import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../../../core/errors/AppError.js";
import ValidationError from "../../../core/errors/ValidationError.js";

export default class AuthService {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async register({ email, password, store_name }) {
    if (!email || !password || !store_name) {
      throw new ValidationError("All fields are required");
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password_hash,
      store_name,
    });

    return user;
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError("Email and password required");
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const token = this.tokenService.generateToken({
      userId: user.user_id,
      email: user.email,
      role: "USER",
    });

    return {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        store_name: user.store_name,
      },
    };
  }
}
