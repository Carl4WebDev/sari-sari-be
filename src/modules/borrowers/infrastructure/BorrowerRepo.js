import IBorrowerRepo from "../domain/IBorrowerRepo.js";
import db from "../../../core/database/db.js";

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

  async findAllByUserId(userId) {
    const result = await db.query(
      `
    SELECT
      profile_image_url,
      borrower_id,
      first_name,
      middle_name,
      last_name,
      dob,
      contact_number,
      created_at
    FROM borrowers
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
      [userId],
    );

    return result.rows;
  }

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
}
