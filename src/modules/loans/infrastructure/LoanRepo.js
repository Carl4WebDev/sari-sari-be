import db from "../../../core/database/db.js";

export default class LoanRepo {
  async createLoanTransaction(borrowerId, userId, totalAmount, items) {
    const client = await db.getClient(); // FIX

    try {
      await client.query("BEGIN");

      const transactionResult = await client.query(
        `
        INSERT INTO transactions
        (borrower_id, user_id, type, transaction_date, total_amount)
        VALUES ($1,$2,'LOAN',NOW(),$3)
        RETURNING transaction_id
        `,
        [borrowerId, userId, totalAmount],
      );

      const transactionId = transactionResult.rows[0].transaction_id;

      for (const item of items) {
        await client.query(
          `
          INSERT INTO loan_items
          (transaction_id, product_name, quantity, price, subtotal)
          VALUES ($1,$2,$3,$4,$5)
          `,
          [
            transactionId,
            item.product_name,
            item.quantity,
            item.price,
            item.subtotal,
          ],
        );
      }

      await client.query("COMMIT");

      return { transaction_id: transactionId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release(); // return connection to pool
    }
  }
}
