import Product from "../domain/Product.js";

export default class ProductService {
  constructor(productRepo) {
    this.productRepo = productRepo;
  }

  async createProduct(data, userId) {
    if (!data.product_name) {
      throw new Error("Product name is required");
    }

    if (!data.product_price) {
      throw new Error("Product price is required");
    }

    return await this.productRepo.create({
      user_id: userId,
      product_name: data.product_name,
      product_price: Number(data.product_price),
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
      throw new Error("Product not found");
    }

    return await this.productRepo.update(productId, userId, data);
  }

  async deleteProduct(productId, userId) {
    const existingProduct = await this.productRepo.findByIdAndUserId(
      productId,
      userId,
    );

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    return await this.productRepo.deactivate(productId, userId);
  }
}
