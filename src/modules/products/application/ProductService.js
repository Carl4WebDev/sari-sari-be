import Product from "../domain/Product.js";
import AppError from "../../../core/errors/AppError.js";
import ValidationError from "../../../core/errors/ValidationError.js";
import { validateProductInput } from "./validators/productValidator.js";

export default class ProductService {
  constructor(productRepo) {
    this.productRepo = productRepo;
  }

  async createProduct(data, userId) {
    const validatedData = validateProductInput(data);

    const existingProduct = await this.productRepo.findByNameAndUserId(
      validatedData.product_name,
      userId,
    );

    if (existingProduct) {
      throw new AppError("Product already exists", 409, "PRODUCT_EXISTS");
    }

    return await this.productRepo.create({
      user_id: userId,
      product_name: validatedData.product_name,
      product_price: validatedData.product_price,
      quantity: validatedData.quantity,
      category: validatedData.category,
      unit: validatedData.unit,
    });
  }

  async getProducts(userId) {
    return await this.productRepo.findAllByUserId(userId);
  }

  async updateProduct(productId, data, userId) {
    const existingProduct = await this.productRepo.findByIdAndUserId(
      productId,
      userId,
    );

    if (!existingProduct) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const validatedData = validateProductInput(data);

    return await this.productRepo.update(productId, userId, validatedData);
  }

  async deleteProduct(productId, userId) {
    const existingProduct = await this.productRepo.findByIdAndUserId(
      productId,
      userId,
    );

    if (!existingProduct) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return await this.productRepo.deactivate(productId, userId);
  }

  async archiveProduct(productId, userId) {
    const product = await this.productRepo.archiveProduct(productId, userId);

    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  }

  async getArchivedProducts(userId) {
    return await this.productRepo.findArchivedByUserId(userId);
  }

  async reactivateProduct(productId, userId) {
    const product = await this.productRepo.reactivateProduct(productId, userId);

    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  }
}
