import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import ProductRepo from "../../infrastructure/ProductRepo.js";
import ProductService from "../../application/ProductService.js";

const productRepository = new ProductRepo();
const productService = new ProductService(productRepository);

export const createProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await productService.createProduct(req.body, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Product created",
    data: result,
  });
});

export const getProducts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const products = await productService.getProducts(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Products fetched",
    data: products,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  const updatedProduct = await productService.updateProduct(
    productId,
    req.body,
    userId,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Product updated",
    data: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  await productService.deleteProduct(productId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Product deleted",
  });
});

export const archiveProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  const result = await productService.archiveProduct(productId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Product archived",
    data: result,
  });
});

export const getArchivedProducts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await productService.getArchivedProducts(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Archived products fetched",
    data: result,
  });
});

export const reactivateProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  const result = await productService.reactivateProduct(productId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Product reactivated",
    data: result,
  });
});
