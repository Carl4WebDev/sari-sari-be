import db from "../../../core/database/db.js";

class ExpenseRepo {
  async create(userId, data) {
    const result = await db.query(
      `INSERT INTO expenses (user_id, amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, data.amount, data.category, data.description || null, data.expense_date],
    );
    return result.rows[0];
  }

  async findAllByUserId(userId, { month, year } = {}) {
    let query = `
      SELECT expense_id, user_id, amount, category, description, expense_date, created_at, updated_at
      FROM expenses
      WHERE user_id = $1
    `;
    const params = [userId];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM expense_date) = $2 AND EXTRACT(YEAR FROM expense_date) = $3`;
      params.push(month, year);
    }

    query += ` ORDER BY expense_date DESC, created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  async findById(expenseId, userId) {
    const result = await db.query(
      `SELECT * FROM expenses WHERE expense_id = $1 AND user_id = $2`,
      [expenseId, userId],
    );
    return result.rows[0];
  }

  async update(expenseId, userId, data) {
    const result = await db.query(
      `UPDATE expenses
       SET amount = $3, category = $4, description = $5, expense_date = $6, updated_at = CURRENT_TIMESTAMP
       WHERE expense_id = $1 AND user_id = $2
       RETURNING *`,
      [expenseId, userId, data.amount, data.category, data.description || null, data.expense_date],
    );
    return result.rows[0];
  }

  async delete(expenseId, userId) {
    const result = await db.query(
      `DELETE FROM expenses WHERE expense_id = $1 AND user_id = $2 RETURNING expense_id`,
      [expenseId, userId],
    );
    return result.rows[0];
  }

  async getTotalByPeriod(userId, startDate, endDate) {
    const result = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2 AND expense_date <= $3`,
      [userId, startDate, endDate],
    );
    return Number(result.rows[0].total);
  }

  async getTotalByCategory(userId, startDate, endDate) {
    const result = await db.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2 AND expense_date <= $3
       GROUP BY category
       ORDER BY total DESC`,
      [userId, startDate, endDate],
    );
    return result.rows.map((r) => ({ category: r.category, total: Number(r.total) }));
  }
}

export default ExpenseRepo;
