import db from "../../../core/database/db.js";

export default class DashboardRepo {
  async getDashboardStats(userId) {
    const result = await db.query(
      `
      SELECT
        COUNT(DISTINCT b.borrower_id) AS total_borrowers,

        COUNT(DISTINCT CASE
          WHEN DATE(b.created_at) = CURRENT_DATE
          THEN b.borrower_id
        END) AS new_borrowers_today,

        COUNT(DISTINCT CASE
          WHEN DATE_TRUNC('month', b.created_at)
            = DATE_TRUNC('month', CURRENT_DATE)
          THEN b.borrower_id
        END) AS new_borrowers_this_month,

        COALESCE(SUM(
          CASE
            WHEN t.type = 'LOAN'
              THEN t.total_amount
            WHEN t.type = 'PAYMENT'
              THEN -t.total_amount
            ELSE 0
          END
        ), 0) AS total_utang

      FROM borrowers b
      LEFT JOIN transactions t
        ON t.borrower_id = b.borrower_id

      WHERE b.user_id = $1
        AND b.is_active = true
        AND (t.voided = false OR t.voided IS NULL)
      `,
      [userId],
    );

    return result.rows[0];
  }

  async getBorrowerPaymentStats(userId) {
    const result = await db.query(
      `
      SELECT
        COUNT(*) FILTER (
          WHERE balance <= 0
        ) AS fully_paid,

        COUNT(*) FILTER (
          WHERE balance > 0
        ) AS with_balance

      FROM (
        SELECT
          b.borrower_id,

          COALESCE(SUM(
            CASE
              WHEN t.type = 'LOAN'
                THEN t.total_amount
              WHEN t.type = 'PAYMENT'
                THEN -t.total_amount
              ELSE 0
            END
          ), 0) AS balance

        FROM borrowers b
        LEFT JOIN transactions t
          ON t.borrower_id = b.borrower_id

        WHERE b.user_id = $1
          AND b.is_active = true
          AND (t.voided = false OR t.voided IS NULL)

        GROUP BY b.borrower_id
      ) balances
      `,
      [userId],
    );

    return result.rows[0];
  }

  async getBusiestDay(userId) {
    const result = await db.query(
      `
      SELECT
        TO_CHAR(transaction_date, 'Day') AS day,
        COUNT(*) AS total

      FROM transactions t
      INNER JOIN borrowers b
        ON b.borrower_id = t.borrower_id

      WHERE b.user_id = $1
        AND b.is_active = true
        AND (t.voided = false OR t.voided IS NULL)

      GROUP BY day

      ORDER BY total DESC

      LIMIT 1
      `,
      [userId],
    );

    return result.rows[0] || null;
  }

  async getBusiestHour(userId) {
    const result = await db.query(
      `
    SELECT
      EXTRACT(HOUR FROM t.created_at) AS hour,
      COUNT(*) AS total
    FROM transactions t
    INNER JOIN borrowers b
      ON b.borrower_id = t.borrower_id
    WHERE b.user_id = $1
      AND b.is_active = true
      AND (t.voided = false OR t.voided IS NULL)
    GROUP BY hour
    ORDER BY total DESC
    LIMIT 1
    `,
      [userId],
    );

    return result.rows[0] || null;
  }

  async getRecentActivities(userId) {
    const result = await db.query(
      `
    SELECT
      t.transaction_id,
      t.type,
      t.total_amount,
      t.created_at,
      b.borrower_id,
      b.first_name,
      b.last_name,
      b.borrower_id
    FROM transactions t
    INNER JOIN borrowers b
      ON b.borrower_id = t.borrower_id
    WHERE b.user_id = $1
      AND b.is_active = true
      AND (t.voided = false OR t.voided IS NULL)
    ORDER BY t.created_at DESC
    LIMIT 5
    `,
      [userId],
    );

    return result.rows;
  }

  async getMonthlyUtangTrend(userId) {
    const result = await db.query(
      `
    SELECT
      TO_CHAR(DATE_TRUNC('month', t.created_at), 'Mon') AS month,
      DATE_TRUNC('month', t.created_at) AS month_date,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'LOAN' THEN t.total_amount
          WHEN t.type = 'PAYMENT' THEN -t.total_amount
          ELSE 0
        END
      ), 0) AS total
    FROM transactions t
    INNER JOIN borrowers b
      ON b.borrower_id = t.borrower_id
    WHERE b.user_id = $1
      AND b.is_active = true
      AND (t.voided = false OR t.voided IS NULL)
    GROUP BY month_date
    ORDER BY month_date ASC
    `,
      [userId],
    );

    return result.rows;
  }

  async getTopBorrowers(userId) {
    const result = await db.query(
      `
    SELECT
      b.borrower_id,
      b.first_name,
      b.last_name,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'LOAN' THEN t.total_amount
          WHEN t.type = 'PAYMENT' THEN -t.total_amount
          ELSE 0
        END
      ), 0) AS balance
    FROM borrowers b
    LEFT JOIN transactions t
      ON t.borrower_id = b.borrower_id
    WHERE b.user_id = $1
      AND b.is_active = true
      AND (t.voided = false OR t.voided IS NULL)
    GROUP BY b.borrower_id
    HAVING COALESCE(SUM(
      CASE
        WHEN t.type = 'LOAN' THEN t.total_amount
        WHEN t.type = 'PAYMENT' THEN -t.total_amount
        ELSE 0
      END
    ), 0) > 0
    ORDER BY balance DESC
    LIMIT 5
    `,
      [userId],
    );

    return result.rows;
  }

  async getCalendarReminders(userId, startDate, endDate) {
    const result = await db.query(
      `
      SELECT
        cr.due_date::text AS due_date,
        json_agg(
          json_build_object(
            'reminder_id', cr.reminder_id,
            'borrower_id', cr.borrower_id,
            'borrower_name', b.first_name || ' ' || b.last_name,
            'amount_expected', cr.amount_expected,
            'status', cr.status,
            'note', cr.note
          )
          ORDER BY cr.created_at
        ) AS reminders
      FROM collection_reminders cr
      INNER JOIN borrowers b
        ON b.borrower_id = cr.borrower_id
      WHERE cr.user_id = $1
        AND cr.due_date >= $2
        AND cr.due_date <= $3
        AND cr.status IN ('PENDING', 'OVERDUE', 'DONE')
      GROUP BY cr.due_date
      ORDER BY cr.due_date ASC
      `,
      [userId, startDate, endDate],
    );

    return result.rows;
  }

  async getCollectionReminderStats(userId, startDate, endDate) {
    const result = await db.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE status = 'DONE') AS done_count,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue_count,
        COUNT(*) AS total_reminders,
        COALESCE(SUM(amount_expected) FILTER (WHERE status IN ('PENDING', 'OVERDUE')), 0) AS total_expected,
        COALESCE(SUM(amount_expected) FILTER (WHERE status = 'DONE'), 0) AS total_done_amount,
        COUNT(*) FILTER (
          WHERE status = 'DONE'
            AND DATE(updated_at) <= due_date
        ) AS on_time_count
      FROM collection_reminders
      WHERE user_id = $1
        AND due_date >= $2
        AND due_date <= $3
      `,
      [userId, startDate, endDate],
    );

    return result.rows[0];
  }

  async getCollectionPayments(userId, startDate, endDate) {
    const result = await db.query(
      `
      SELECT
        COALESCE(SUM(t.total_amount), 0) AS total_payments_collected
      FROM transactions t
      INNER JOIN borrowers b
        ON b.borrower_id = t.borrower_id
      WHERE b.user_id = $1
        AND b.is_active = true
        AND t.type = 'PAYMENT'
        AND (t.voided = false OR t.voided IS NULL)
        AND t.transaction_date >= $2
        AND t.transaction_date <= $3
      `,
      [userId, startDate, endDate],
    );

    return result.rows[0];
  }

  async getCollectionTrend(userId) {
    const result = await db.query(
      `
      SELECT
        t.transaction_date::text AS date,
        COALESCE(SUM(t.total_amount), 0) AS total
      FROM transactions t
      INNER JOIN borrowers b
        ON b.borrower_id = t.borrower_id
      WHERE b.user_id = $1
        AND b.is_active = true
        AND t.type = 'PAYMENT'
        AND (t.voided = false OR t.voided IS NULL)
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY t.transaction_date
      ORDER BY t.transaction_date ASC
      `,
      [userId],
    );

    return result.rows;
  }
}
