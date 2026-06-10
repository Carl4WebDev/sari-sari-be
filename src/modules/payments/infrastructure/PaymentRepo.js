import db from "../../../core/database/db.js";

export default class PaymentRepo {
  async create(payment) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      // 1️⃣ Lock rows first (FOR UPDATE), then aggregate in app
      const lockQuery = `
        SELECT type, total_amount
        FROM transactions
        WHERE borrower_id = $1
          AND (voided = false OR voided IS NULL)
        FOR UPDATE
      `;

      const lockedRows = await client.query(lockQuery, [payment.borrower_id]);

      const balance = lockedRows.rows.reduce((sum, row) => {
        if (row.type === "LOAN") return sum + Number(row.total_amount);
        if (row.type === "PAYMENT") return sum - Number(row.total_amount);
        return sum;
      }, 0);

      if (payment.amount > balance) {
        throw new Error("BALANCE_EXCEEDED");
      }

      // 2️⃣ Insert transaction
      const transactionQuery = `
        INSERT INTO transactions
        (borrower_id, type, transaction_date, total_amount, user_id)
        VALUES ($1, 'PAYMENT', CURRENT_DATE, $2, $3)
        RETURNING transaction_id
      `;

      const transactionResult = await client.query(transactionQuery, [
        payment.borrower_id,
        payment.amount,
        payment.user_id,
      ]);

      const transactionId = transactionResult.rows[0].transaction_id;

      // 3️⃣ Insert payment details
      const detailsQuery = `
        INSERT INTO payment_details
        (transaction_id, payment_method, note)
        VALUES ($1, $2, $3)
      `;

      await client.query(detailsQuery, [
        transactionId,
        payment.payment_type,
        payment.note,
      ]);

      await client.query("COMMIT");

      return { transaction_id: transactionId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
