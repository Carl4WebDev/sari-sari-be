export default class DashboardService {
  constructor(dashboardRepo) {
    this.dashboardRepo = dashboardRepo;
  }

  async getDashboard(userId) {
    const [
      stats,
      paymentStats,
      busiestDay,
      busiestHour,
      recentActivities,
      monthlyUtangTrend,
      topBorrowers,
    ] = await Promise.all([
      this.dashboardRepo.getDashboardStats(userId),
      this.dashboardRepo.getBorrowerPaymentStats(userId),
      this.dashboardRepo.getBusiestDay(userId),
      this.dashboardRepo.getBusiestHour(userId),
      this.dashboardRepo.getRecentActivities(userId),
      this.dashboardRepo.getMonthlyUtangTrend(userId),
      this.dashboardRepo.getTopBorrowers(userId),
    ]);

    return {
      total_utang: Number(stats.total_utang || 0),

      total_borrowers: Number(stats.total_borrowers || 0),

      new_borrowers_today: Number(stats.new_borrowers_today || 0),

      new_borrowers_this_month: Number(stats.new_borrowers_this_month || 0),

      fully_paid: Number(paymentStats.fully_paid || 0),

      with_balance: Number(paymentStats.with_balance || 0),

      busiest_day: busiestDay?.day?.trim() || null,

      busiest_hour: busiestHour?.hour != null ? `${busiestHour.hour}:00` : null,

      recent_activities: recentActivities.map((a) => ({
        transaction_id: a.transaction_id,

        type: a.type,

        borrower_id: a.borrower_id,

        amount: Number(a.total_amount),

        borrower_name: `${a.first_name} ${a.last_name}`,

        created_at: a.created_at,
      })),

      monthly_utang_trend: monthlyUtangTrend.map((m) => ({
        month: m.month,
        total: Number(m.total),
      })),

      top_borrowers: topBorrowers.map((b) => ({
        borrower_id: b.borrower_id,
        name: `${b.first_name} ${b.last_name}`,
        balance: Number(b.balance),
      })),
    };
  }

  async getCalendarData(userId, year, month) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;

    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const rows = await this.dashboardRepo.getCalendarReminders(
      userId,
      startDate,
      endDate,
    );

    return rows.map((row) => ({
      due_date: row.due_date,
      reminders: row.reminders,
    }));
  }

  async getCollectionStats(userId, period) {
    const now = new Date();
    let startDate, endDate;

    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
    } else {
      // week — Monday to Sunday
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      startDate = monday.toISOString().split("T")[0];
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      endDate = sunday.toISOString().split("T")[0];
    }

    const [reminderStats, paymentStats] = await Promise.all([
      this.dashboardRepo.getCollectionReminderStats(userId, startDate, endDate),
      this.dashboardRepo.getCollectionPayments(userId, startDate, endDate),
    ]);

    const doneCount = Number(reminderStats.done_count || 0);
    const onTimeCount = Number(reminderStats.on_time_count || 0);

    return {
      total_collected: Number(paymentStats.total_payments_collected || 0),
      total_expected: Number(reminderStats.total_expected || 0),
      on_time_rate: doneCount > 0 ? Math.round((onTimeCount / doneCount) * 1000) / 10 : 0,
      done_count: doneCount,
      pending_count: Number(reminderStats.pending_count || 0),
      overdue_count: Number(reminderStats.overdue_count || 0),
      total_reminders: Number(reminderStats.total_reminders || 0),
    };
  }

  async getCollectionTrend(userId) {
    const rows = await this.dashboardRepo.getCollectionTrend(userId);

    return rows.map((r) => {
      const d = new Date(r.date + "T00:00:00");
      return {
        date: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total: Number(r.total),
      };
    });
  }
}
