import db from "../../../core/database/db.js";

export default class CollectionReminderRepo {
  async create(data) {
    const result = await db.query(
      `
      INSERT INTO collection_reminders
      (user_id, borrower_id, amount_expected, due_date, note, send_sms)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        data.user_id,
        data.borrower_id,
        data.amount_expected,
        data.due_date,
        data.note,
        data.send_sms || false,
      ],
    );

    return result.rows[0];
  }

  async findByBorrowerId(borrowerId, userId) {
    const result = await db.query(
      `
      SELECT *
      FROM collection_reminders
      WHERE borrower_id = $1
        AND user_id = $2
      ORDER BY due_date ASC, created_at DESC
      `,
      [borrowerId, userId],
    );

    return result.rows;
  }

  async findDashboardReminders(userId) {
    const result = await db.query(
      `
      SELECT
        cr.*,
        b.first_name,
        b.last_name,
        b.contact_number
      FROM collection_reminders cr
      INNER JOIN borrowers b
        ON b.borrower_id = cr.borrower_id
      WHERE cr.user_id = $1
        AND cr.status IN ('PENDING', 'OVERDUE')
      ORDER BY cr.due_date ASC
      `,
      [userId],
    );

    return result.rows;
  }

  async findById(reminderId, userId) {
    const result = await db.query(
      `
      SELECT * FROM collection_reminders
      WHERE reminder_id = $1 AND user_id = $2
      `,
      [reminderId, userId],
    );

    return result.rows[0];
  }

  async escalateOverdue(userId) {
    await db.query(
      `
      UPDATE collection_reminders
      SET status = 'OVERDUE',
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
        AND status = 'PENDING'
        AND due_date < CURRENT_DATE
      `,
      [userId],
    );
  }

  async updateStatus(reminderId, userId, status) {
    const result = await db.query(
      `
      UPDATE collection_reminders
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE reminder_id = $2
        AND user_id = $3
      RETURNING *
      `,
      [status, reminderId, userId],
    );

    return result.rows[0];
  }

  async delete(reminderId, userId) {
    const result = await db.query(
      `
      DELETE FROM collection_reminders
      WHERE reminder_id = $1
        AND user_id = $2
      RETURNING *
      `,
      [reminderId, userId],
    );

    return result.rows[0];
  }
}
