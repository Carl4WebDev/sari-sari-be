import ValidationError from "../../../../core/errors/ValidationError.js";

const sanitizeString = (value) => {
  if (typeof value !== "string") return value;

  return value.trim().replace(/\s+/g, " ");
};

const isEmpty = (value) => {
  return value === undefined || value === null || value === "";
};

const hasMaxLength = (value, max) => {
  if (!value) return true;
  return String(value).length <= max;
};

const isValidNumber = (value) => {
  return !isNaN(value) && Number(value) >= 0;
};

const isPositiveInteger = (value) => {
  return Number.isInteger(Number(value)) && Number(value) >= 0;
};

export const validateProductInput = (data) => {
  const errors = {};

  const product = {
    product_name: sanitizeString(data.product_name),
    product_price: Number(data.product_price),
    quantity: Number(data.quantity ?? 0),
    category: sanitizeString(data.category),
    unit: sanitizeString(data.unit),
  };

  if (isEmpty(product.product_name)) {
    errors.product_name = "Product name is required";
  } else if (!hasMaxLength(product.product_name, 100)) {
    errors.product_name = "Product name must not exceed 100 characters";
  }

  if (isEmpty(data.product_price)) {
    errors.product_price = "Product price is required";
  } else if (!isValidNumber(product.product_price)) {
    errors.product_price = "Product price must be a valid positive number";
  }

  if (!isPositiveInteger(product.quantity)) {
    errors.quantity = "Quantity must be a valid whole number";
  }

  if (!isEmpty(product.category) && !hasMaxLength(product.category, 50)) {
    errors.category = "Category must not exceed 50 characters";
  }

  if (!isEmpty(product.unit) && !hasMaxLength(product.unit, 20)) {
    errors.unit = "Unit must not exceed 20 characters";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return product;
};
