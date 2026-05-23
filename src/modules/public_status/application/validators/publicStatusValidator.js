import NotFoundError from "../../../../core/errors/NotFoundError.js";

export const validatePublicToken = (token) => {
  const sanitizedToken = token?.trim();

  const tokenRegex = /^[a-zA-Z0-9_-]{32,128}$/;

  if (!sanitizedToken || !tokenRegex.test(sanitizedToken)) {
    throw new NotFoundError("Status page not found");
  }

  return sanitizedToken;
};
