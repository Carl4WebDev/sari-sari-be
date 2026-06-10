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

export const validateProductInput = (data) => {
  const errors = {};

  const product = {
    product_name: sanitizeString(data.product_name),
    product_price: Number(data.product_price),
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

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return product;
};
