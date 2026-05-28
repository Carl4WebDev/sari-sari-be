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

  async update(borrowerId, userId, data) {
    const result = await db.query(
      `
      UPDATE borrowers
      SET first_name = $1,
          middle_name = $2,
          last_name = $3,
          dob = $4,
          contact_number = $5,
          updated_at = NOW()
      WHERE borrower_id = $6
        AND user_id = $7
      RETURNING *
      `,
      [
        data.first_name,
        data.middle_name || null,
        data.last_name,
        data.dob || null,
        data.contact_number || null,
        borrowerId,
        userId,
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
        AND (t.voided = false OR t.voided IS NULL)
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
      AND (t.voided = false OR t.voided IS NULL)

    WHERE b.user_id = $1
      AND b.is_active = false

    GROUP BY b.borrower_id

    ORDER BY b.first_name ASC, b.last_name ASC
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
      AND (t.voided = false OR t.voided IS NULL)

    WHERE b.user_id = $1
      AND b.is_active = true

    GROUP BY b.borrower_id

    ORDER BY b.first_name ASC, b.last_name ASC
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

  async findTransactionsByBorrowerId(borrowerId) {
    const result = await db.query(
      `
    SELECT
      t.transaction_id,
      t.type,
      t.transaction_date,
      t.total_amount,
      t.created_at,
      t.voided,
      t.voided_at,
      t.void_reason,
      pd.payment_method,
      pd.note AS payment_note

    FROM transactions t

    LEFT JOIN payment_details pd
      ON pd.transaction_id = t.transaction_id

    WHERE t.borrower_id = $1

    ORDER BY t.created_at DESC, t.transaction_id DESC
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
      AND (voided = false OR voided IS NULL)
    `,
      [borrowerId],
    );

    return Number(result.rows[0].balance);
  }

  async voidTransaction(transactionId, borrowerId, reason) {
    const result = await db.query(
      `
    UPDATE transactions
    SET voided = true, voided_at = NOW(), void_reason = $1
    WHERE transaction_id = $2
      AND borrower_id = $3
      AND (voided = false OR voided IS NULL)
    RETURNING transaction_id, voided, voided_at, void_reason
    `,
      [reason || null, transactionId, borrowerId],
    );

    return result.rows[0] || null;
  }

  async findTransactionById(transactionId) {
    const result = await db.query(
      `
    SELECT transaction_id, borrower_id, type, total_amount, voided
    FROM transactions
    WHERE transaction_id = $1
    `,
      [transactionId],
    );

    return result.rows[0] || null;
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
        crypto.randomBytes(32).toString("base64url") +
        String(userId) +
        String(borrowerId);
    }

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

  async createNote(borrowerId, noteText) {
    const result = await db.query(
      `
    INSERT INTO borrower_notes (
      borrower_id,
      note_text
    )
    VALUES ($1, $2)
    RETURNING *
    `,
      [borrowerId, noteText],
    );

    return result.rows[0];
  }

  async getNotesByBorrowerId(borrowerId) {
    const result = await db.query(
      `
    SELECT
      borrower_note_id,
      borrower_id,
      note_text,
      created_at
    FROM borrower_notes
    WHERE borrower_id = $1
    ORDER BY created_at DESC
    `,
      [borrowerId],
    );

    return result.rows;
  }

  async updateNote(noteId, borrowerId, noteText) {
    const result = await db.query(
      `
    UPDATE borrower_notes
    SET note_text = $1
    WHERE borrower_note_id = $2
      AND borrower_id = $3
    RETURNING *
    `,
      [noteText, noteId, borrowerId],
    );

    return result.rows[0];
  }

  async deleteNote(noteId, borrowerId) {
    const result = await db.query(
      `
    DELETE FROM borrower_notes
    WHERE borrower_note_id = $1
      AND borrower_id = $2
    RETURNING *
    `,
      [noteId, borrowerId],
    );

    return result.rows[0];
  }

  async updatePublicTokenExpiration(borrowerId, userId, expiresAt) {
    const result = await db.query(
      `
    UPDATE borrowers
    SET public_token_expires_at = $1
    WHERE borrower_id = $2
      AND user_id = $3
    RETURNING *
    `,
      [expiresAt, borrowerId, userId],
    );

    return result.rows[0] || null;
  }
}
