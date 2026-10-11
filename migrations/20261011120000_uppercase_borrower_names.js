export const up = async (pgm) => {
  // Uppercase all existing borrower names for consistency
  pgm.sql(`
    UPDATE borrowers
    SET
      first_name = UPPER(first_name),
      middle_name = CASE WHEN middle_name IS NOT NULL THEN UPPER(middle_name) ELSE NULL END,
      last_name = UPPER(last_name)
    WHERE
      first_name <> UPPER(first_name)
      OR (middle_name IS NOT NULL AND middle_name <> UPPER(middle_name))
      OR last_name <> UPPER(last_name)
  `);
};

export const down = async (pgm) => {
  // Cannot reverse uppercase — original casing is lost
};