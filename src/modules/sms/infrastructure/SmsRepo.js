import db from "../../../core/database/db.js";

export default class SmsRepo {
  async logSms(data) {
    const result = await db.query(
      `
      INSERT INTO sms_logs (user_id, borrower_id, reminder_id, recipient_number, message, status, semaphore_message_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        data.user_id,
        data.borrower_id,
        data.reminder_id || null,
        data.recipient_number,
        data.message,
        data.status,
        data.semaphore_message_id || null,
      ],
    );

    return result.rows[0];
  }

  async countRecentSms(userId, sinceTimestamp) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM sms_logs WHERE user_id = $1 AND created_at >= $2`,
      [userId, sinceTimestamp],
    );

    return parseInt(result.rows[0].count, 10);
  }

  async findByReminderId(reminderId) {
    const result = await db.query(
      `SELECT * FROM sms_logs WHERE reminder_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [reminderId],
    );

    return result.rows[0];
  }
}
