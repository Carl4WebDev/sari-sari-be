import db from "../../../core/database/db.js";

export default class PushSubscriptionRepo {
  async create(userId, subscription) {
    const result = await db.query(
      `
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = $3, auth = $4
      RETURNING *
      `,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
    );

    return result.rows[0];
  }

  async findByUserId(userId) {
    const result = await db.query(
      `SELECT * FROM push_subscriptions WHERE user_id = $1`,
      [userId],
    );

    return result.rows;
  }

  async deleteByEndpoint(userId, endpoint) {
    await db.query(
      `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
      [userId, endpoint],
    );
  }
}
