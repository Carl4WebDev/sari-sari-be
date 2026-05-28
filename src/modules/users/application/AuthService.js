import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../../../core/errors/AppError.js";
import ValidationError from "../../../core/errors/ValidationError.js";

export default class AuthService {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  validateRegisterInput({ email, password, store_name }) {
    const errors = {};

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedStoreName = store_name?.trim();

    if (!normalizedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!normalizedStoreName) {
      errors.store_name = "Store name is required";
    } else if (normalizedStoreName.length > 100) {
      errors.store_name = "Store name must not exceed 100 characters";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    return {
      email: normalizedEmail,
      password,
      store_name: normalizedStoreName,
    };
  }

  async register(data) {
    const { email, password, store_name } = this.validateRegisterInput(data);

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

  validateLoginInput({ email, password }) {
    const errors = {};

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    return {
      email: normalizedEmail,
      password,
    };
  }

  async login(data) {
    const { email, password } = this.validateLoginInput(data);

    const user = await this.userRepository.findByEmail(email);

    // Generic message. Do not reveal if email exists.
    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
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

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
  }

  async updateStoreName(userId, storeName) {
    const errors = {};

    const normalizedStoreName = storeName?.trim();

    if (!normalizedStoreName) {
      errors.store_name = "Store name is required";
    } else if (normalizedStoreName.length > 100) {
      errors.store_name = "Store name must not exceed 100 characters";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    const updated = await this.userRepository.updateStoreName(
      userId,
      normalizedStoreName,
    );

    if (!updated) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return updated;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const errors = {};

    if (!currentPassword) {
      errors.current_password = "Current password is required";
    }

    if (!newPassword) {
      errors.new_password = "New password is required";
    } else if (newPassword.length < 8) {
      errors.new_password = "New password must be at least 8 characters";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    const user = await this.userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);

    if (!match) {
      throw new AppError(
        "Current password is incorrect",
        401,
        "INVALID_PASSWORD",
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, passwordHash);

    return { message: "Password updated successfully" };
  }
}
