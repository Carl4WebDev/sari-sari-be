import IBorrowerRepo from "../domain/IBorrowerRepo.js";
import db from "../../../core/database/db.js";
import crypto from "crypto";

export default class BorrowerRepoImpl extends IBorrowerRepo {
  async create(borrower) {
    const result = await db.query(
      `
      INSERT INTO borrowers
      (user_id, first_name, middle_name, last_name, dob, contact_number)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        borrower.user_id,
        borrower.first_name,
        borrower.middle_name,
        borrower.last_name,
        borrower.dob,
        borrower.contact_number,
      ],
    );

    return result.rows[0];
  }

  async archiveBorrower(borrowerId, userId) {
    const result = await db.query(
      `
    WITH balance_check AS (
      SELECT
        b.borrower_id,
        COALESCE(SUM(
          CASE
            WHEN t.type = 'LOAN' THEN t.total_amount
            WHEN t.type = 'PAYMENT' THEN -t.total_amount
            ELSE 0
          END
        ), 0) AS balance
      FROM borrowers b
      LEFT JOIN transactions t
        ON t.borrower_id = b.borrower_id
      WHERE b.borrower_id = $1
        AND b.user_id = $2
      GROUP BY b.borrower_id
    )
    UPDATE borrowers b
    SET is_active = false
    FROM balance_check bc
    WHERE b.borrower_id = bc.borrower_id
      AND bc.balance <= 0
    RETURNING b.*
    `,
      [borrowerId, userId],
    );

    return result.rows[0];
  }
  async findArchivedByUserId(userId) {
    const result = await db.query(
      `
    SELECT
      b.profile_image_url,
      b.borrower_id,
      b.first_name,
      b.middle_name,
      b.last_name,
      b.dob,
      b.contact_number,
      b.public_token,
      b.token_enabled,
      b.is_active,
      b.created_at,

      COALESCE(SUM(
        CASE
          WHEN t.type = 'LOAN' THEN t.total_amount
          WHEN t.type = 'PAYMENT' THEN -t.total_amount
          ELSE 0
        END
      ), 0) AS balance

    FROM borrowers b
    LEFT JOIN transactions t
      ON t.borrower_id = b.borrower_id

    WHERE b.user_id = $1
      AND b.is_active = false

    GROUP BY b.borrower_id

    ORDER BY b.created_at DESC
    `,
      [userId],
    );

    return result.rows.map((row) => ({
      ...row,
      balance: Number(row.balance),
    }));
  }
  async reactivateBorrower(borrowerId, userId) {
    const result = await db.query(
      `
    UPDATE borrowers
    SET is_active = true
    WHERE borrower_id = $1
      AND user_id = $2
    RETURNING *
    `,
      [borrowerId, userId],
    );

    return result.rows[0];
  }

  async findAllByUserId(userId) {
    const result = await db.query(
      `
    SELECT
      b.profile_image_url,
      b.borrower_id,
      b.first_name,
      b.middle_name,
      b.last_name,
      b.dob,
      b.contact_number,
      b.public_token,
      b.token_enabled,
      b.is_active,
      b.created_at,

      COALESCE(SUM(
        CASE
          WHEN t.type = 'LOAN' THEN t.total_amount
          WHEN t.type = 'PAYMENT' THEN -t.total_amount
          ELSE 0
        END
      ), 0) AS balance

    FROM borrowers b
    LEFT JOIN transactions t
      ON t.borrower_id = b.borrower_id

WHERE b.user_id = $1
  AND b.is_active = true

    GROUP BY b.borrower_id

    ORDER BY b.created_at DESC
    `,
      [userId],
    );

    return result.rows.map((row) => ({
      ...row,
      balance: Number(row.balance),
    }));
  }

  // async updatePublicAccess(borrowerId, enabled, userId) {
  //   const result = await db.query(
  //     `
  //   UPDATE borrowers
  //   SET token_enabled = $1
  //   WHERE borrower_id = $2
  //     AND user_id = $3
  //   RETURNING *
  //   `,
  //     [enabled, borrowerId, userId],
  //   );

  //   return result.rows[0];
  // }

  async getTotalLoanByBorrowerIds(borrowerIds) {
    const result = await db.query(
      `
    SELECT
      borrower_id,
      COALESCE(
        SUM(
          CASE
            WHEN type = 'LOAN' THEN total_amount
            WHEN type = 'PAYMENT' THEN -total_amount
            ELSE 0
          END
        ),
      0) AS total_loan
    FROM transactions
    WHERE borrower_id = ANY($1)
    GROUP BY borrower_id
    `,
      [borrowerIds],
    );

    return result.rows;
  }

  async findTransactionsByBorrowerId(borrowerId) {
    const result = await db.query(
      `
    SELECT
      transaction_id,
      type,
      transaction_date,
      total_amount,
      created_at
    FROM transactions
    WHERE borrower_id = $1
    ORDER BY created_at DESC, transaction_id DESC
    `,
      [borrowerId],
    );

    return result.rows;
  }

  async findLoanItemsByTransactionIds(transactionIds) {
    const result = await db.query(
      `
    SELECT
      transaction_id,
      product_name,
      quantity,
      price
    FROM loan_items
    WHERE transaction_id = ANY($1)
    `,
      [transactionIds],
    );

    return result.rows;
  }

  async findByIdAndUserId(borrowerId, userId) {
    const result = await db.query(
      `
    SELECT
      borrower_id,
      first_name,
      middle_name,
      last_name,
      dob,
      contact_number,
      created_at
    FROM borrowers
    WHERE borrower_id = $1
    AND user_id = $2
    `,
      [borrowerId, userId],
    );

    return result.rows[0];
  }
  async getBorrowerBalance(borrowerId) {
    const result = await db.query(
      `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN type = 'LOAN' THEN total_amount
            WHEN type = 'PAYMENT' THEN -total_amount
          END
        ),
      0) AS balance
    FROM transactions
    WHERE borrower_id = $1
    `,
      [borrowerId],
    );

    return Number(result.rows[0].balance);
  }

  async updateBorrowerProfileImage(borrowerId, userId, imageUrl) {
    const result = await db.query(
      `
    UPDATE borrowers
    SET profile_image_url = $1
    WHERE borrower_id = $2
    AND user_id = $3
    RETURNING *
    `,
      [imageUrl, borrowerId, userId],
    );

    return result.rows[0];
  }

  async updatePublicLoanAccess(borrowerId, enabled, userId) {
    let token = null;

    if (enabled) {
      token =
        crypto.randomBytes(24).toString("hex") +
        String(userId) +
        String(borrowerId);
    }

    console.log("GENERATED TOKEN:", token);
    console.log("GENERATED TOKEN:", enabled);

    const result = await db.query(
      `
  UPDATE borrowers
  SET
    token_enabled = $1,
    public_token =
      CASE
        WHEN public_token IS NULL
          OR public_token = ''
        THEN $2
        ELSE public_token
      END
  WHERE borrower_id = $3
    AND user_id = $4
  RETURNING
    borrower_id,
    token_enabled,
    public_token
  `,
      [enabled, token, borrowerId, userId],
    );

    return result.rows[0];
  }
}
