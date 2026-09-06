import db from "../database/db.js";

export default async function requireActiveSubscription(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT subscription_id, plan, end_date
      FROM subscriptions
      WHERE user_id = $1
        AND status = 'active'
        AND end_date >= (NOW() AT TIME ZONE 'Asia/Manila')::date
      ORDER BY end_date DESC
      LIMIT 1
      `,
      [userId],
    );

    if (!result.rows.length) {
      return res.status(403).json({
        status: "error",
        error: "Active subscription required",
        message: "An active subscription is required to access this feature.",
      });
    }

    req.subscription = result.rows[0];
    req.subscriptionId = result.rows[0].subscription_id;

    next();
  } catch (err) {
    console.error("Subscription middleware error:", err);
    res.status(500).json({ status: "error", error: "Subscription check failed" });
  }
}
