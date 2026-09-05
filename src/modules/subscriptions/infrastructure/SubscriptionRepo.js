import db from "../../../core/database/db.js";

export default class SubscriptionRepo {
  async findActiveByUserId(userId) {
    const query = `
      SELECT *
      FROM subscriptions
      WHERE user_id = $1
        AND status = 'active'
        AND end_date >= NOW()
      ORDER BY end_date DESC
      LIMIT 1;
    `;
    const res = await db.query(query, [userId]);
    return res.rows[0] || null;
  }

  async findHistoryByUserId(userId) {
    const query = `
      SELECT *
      FROM subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const res = await db.query(query, [userId]);
    return res.rows;
  }

  async createSubscription({
    userId,
    plan,
    billingCycle,
    status = "active",
    amount,
    paymentMethod = "GCASH",
    paymentReference = null,
    startDate = new Date(),
    endDate,
  }) {
    // Cancel prior active subscriptions first
    await db.query(
      `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const query = `
      INSERT INTO subscriptions (
        user_id,
        plan,
        billing_cycle,
        status,
        amount,
        payment_method,
        payment_reference,
        start_date,
        end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const res = await db.query(query, [
      userId,
      plan.toUpperCase(),
      billingCycle.toLowerCase(),
      status,
      amount,
      paymentMethod,
      paymentReference,
      startDate,
      endDate,
    ]);
    return res.rows[0];
  }

  async cancelSubscription(userId) {
    const query = `
      UPDATE subscriptions
      SET status = 'cancelled', updated_at = NOW()
      WHERE user_id = $1 AND status = 'active'
      RETURNING *;
    `;
    const res = await db.query(query, [userId]);
    return res.rows[0] || null;
  }
}
