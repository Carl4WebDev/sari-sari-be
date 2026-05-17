import db from "../database/db.js";

export default async function requireActiveSubscription(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT subscription_id
      FROM user_subscription
      WHERE user_id = $1
        AND status = 'active'
        AND end_date >= NOW()
      LIMIT 1
      `,
      [userId],
    );

    if (!result.rows.length) {
      return res.status(403).json({
        error: "Active subscription required",
      });
    }

    // Optional: attach subscription info if needed later
    req.subscriptionId = result.rows[0].subscription_id;

    next();
  } catch (err) {
    console.error("Subscription middleware error:", err);
    res.status(500).json({ error: "Subscription check failed" });
  }
}
