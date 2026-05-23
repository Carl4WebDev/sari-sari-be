// src/core/utils/inputValidator.js

export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;

  return value.trim().replace(/\s+/g, " "); // removes extra spaces
};

export const isEmpty = (value) => {
  return value === undefined || value === null || value === "";
};

export const isValidNumber = (value) => {
  return !isNaN(value) && Number(value) >= 0;
};

export const isPositiveNumber = (value) => {
  return !isNaN(value) && Number(value) > 0;
};

export const isPositiveInteger = (value) => {
  return Number.isInteger(Number(value)) && Number(value) > 0;
};

export const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const hasMaxLength = (value, max) => {
  if (!value) return true;
  return String(value).length <= max;
};
