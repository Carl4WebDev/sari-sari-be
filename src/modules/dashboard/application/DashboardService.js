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
}
