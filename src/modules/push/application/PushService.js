import { webpush } from "../../../core/push/vapidKeys.js";
import db from "../../../core/database/db.js";

export default class PushService {
  constructor(pushRepo) {
    this.pushRepo = pushRepo;
  }

  async subscribe(userId, subscription) {
    return await this.pushRepo.create(userId, subscription);
  }

  async unsubscribe(userId, endpoint) {
    await this.pushRepo.deleteByEndpoint(userId, endpoint);
  }

  async sendPushToUser(userId, payload) {
    const subscriptions = await this.pushRepo.findByUserId(userId);

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err) {
        // Remove invalid subscriptions (410 Gone)
        if (err.statusCode === 410) {
          await this.pushRepo.deleteByEndpoint(userId, sub.endpoint);
        }
      }
    }
  }

  async checkAndSendDueReminders() {
    // Find all PENDING/OVERDUE reminders due today or earlier
    const result = await db.query(
      `
      SELECT cr.user_id, cr.reminder_id, cr.amount_expected, cr.due_date, cr.status,
             b.first_name, b.last_name
      FROM collection_reminders cr
      INNER JOIN borrowers b ON b.borrower_id = cr.borrower_id
      WHERE cr.status IN ('PENDING', 'OVERDUE')
        AND cr.due_date <= CURRENT_DATE
      `,
    );

    // Escalate PENDING to OVERDUE
    await db.query(
      `
      UPDATE collection_reminders
      SET status = 'OVERDUE', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'PENDING' AND due_date < CURRENT_DATE
      `,
    );

    // Group by user and send one notification per user
    const byUser = {};
    for (const row of result.rows) {
      if (!byUser[row.user_id]) {
        byUser[row.user_id] = [];
      }
      byUser[row.user_id].push(row);
    }

    for (const [userId, reminders] of Object.entries(byUser)) {
      const total = reminders.reduce((sum, r) => sum + Number(r.amount_expected || 0), 0);
      const count = reminders.length;

      await this.sendPushToUser(Number(userId), {
        title: "Collection Reminders",
        body: `You have ${count} overdue collection${count > 1 ? "s" : ""} worth ₱${total.toLocaleString()}`,
        url: "/dashboard",
      });
    }
  }
}
