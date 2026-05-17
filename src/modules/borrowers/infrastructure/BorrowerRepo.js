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
      COALESCE(SUM(total_amount),0) AS total_loan
    FROM transactions
    WHERE borrower_id = ANY($1)
      AND type = 'LOAN'
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
      total_amount
    FROM transactions
    WHERE borrower_id = $1
    ORDER BY transaction_date DESC
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
}
