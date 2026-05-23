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

const isValidDate = (value) => {
  if (!value) return true;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

export const validateBorrowerInput = (data) => {
  const errors = {};

  const borrower = {
    first_name: sanitizeString(data.first_name),
    middle_name: sanitizeString(data.middle_name),
    last_name: sanitizeString(data.last_name),
    dob: data.dob,
    contact_number: sanitizeString(data.contact_number),
  };

  if (isEmpty(borrower.first_name)) {
    errors.first_name = "First name is required";
  } else if (!hasMaxLength(borrower.first_name, 50)) {
    errors.first_name = "First name must not exceed 50 characters";
  }

  if (
    !isEmpty(borrower.middle_name) &&
    !hasMaxLength(borrower.middle_name, 50)
  ) {
    errors.middle_name = "Middle name must not exceed 50 characters";
  }

  if (isEmpty(borrower.last_name)) {
    errors.last_name = "Last name is required";
  } else if (!hasMaxLength(borrower.last_name, 50)) {
    errors.last_name = "Last name must not exceed 50 characters";
  }

  if (!isEmpty(borrower.dob)) {
    if (!isValidDate(borrower.dob)) {
      errors.dob = "Invalid date of birth";
    } else if (new Date(borrower.dob) > new Date()) {
      errors.dob = "Date of birth cannot be in the future";
    }
  }

  if (!isEmpty(borrower.contact_number)) {
    const phoneRegex = /^(09|\+639)\d{9}$/;

    if (!phoneRegex.test(borrower.contact_number)) {
      errors.contact_number = "Invalid Philippine contact number";
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return borrower;
};

export const validateBorrowerNoteInput = (noteText) => {
  const errors = {};

  const sanitizedNote = sanitizeString(noteText);

  if (isEmpty(sanitizedNote)) {
    errors.note = "Note is required";
  } else if (!hasMaxLength(sanitizedNote, 500)) {
    errors.note = "Note must not exceed 500 characters";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return sanitizedNote;
};
