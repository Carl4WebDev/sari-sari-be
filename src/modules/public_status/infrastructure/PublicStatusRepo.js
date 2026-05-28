import db from "../../../core/database/db.js";

export default class PublicStatusRepo {
  async findBorrowerByToken(token) {
    const result = await db.query(
      `
    SELECT
      b.profile_image_url,
      b.borrower_id,
      b.first_name,
      b.last_name,
      u.store_name
    FROM borrowers b
    INNER JOIN users u ON u.user_id = b.user_id
    WHERE b.public_token = $1
      AND b.token_enabled = true
      AND (
        b.public_token_expires_at IS NULL
        OR b.public_token_expires_at > NOW()
      )
    LIMIT 1
    `,
      [token],
    );

    return result.rows[0] || null;
  }

  async findTransactionsByBorrowerId(borrowerId) {
    const result = await db.query(
      `
    SELECT
      t.transaction_id AS id,
      t.type,
      t.transaction_date AS date,
      t.total_amount AS amount,
      t.voided,
      t.voided_at,
      t.void_reason,
      COALESCE(
        json_agg(
          json_build_object(
            'product', li.product_name,
            'quantity', li.quantity,
            'price', li.price
          )
        ) FILTER (WHERE li.loan_item_id IS NOT NULL),
        '[]'
      ) AS items
    FROM transactions t
    LEFT JOIN loan_items li
      ON li.transaction_id = t.transaction_id
    WHERE t.borrower_id = $1
    GROUP BY
      t.transaction_id,
      t.type,
      t.transaction_date,
      t.total_amount,
      t.voided,
      t.voided_at,
      t.void_reason
    ORDER BY t.transaction_date DESC, t.transaction_id DESC
    LIMIT 50
    `,
      [borrowerId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      date: row.date,
      amount: Number(row.amount),
      voided: row.voided || false,
      voided_at: row.voided_at,
      void_reason: row.void_reason,
      items: row.type === "LOAN" ? row.items : [],
    }));
  }
}
