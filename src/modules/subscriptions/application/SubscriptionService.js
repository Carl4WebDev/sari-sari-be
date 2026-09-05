import AppError from "../../../core/errors/AppError.js";

export const PLANS = {
  FREE: {
    id: "free",
    name: "FREE",
    monthlyPrice: 0,
    annualPriceMonthly: 0,
    maxBorrowers: 15,
    allowSms: false,
    allowCustomPdf: false,
    allowCsvExport: false,
    allowCloudSync: true,
  },
  BASIC: {
    id: "basic",
    name: "BASIC",
    monthlyPrice: 149,
    annualPriceMonthly: 119,
    maxBorrowers: 50,
    allowSms: false,
    allowCustomPdf: true,
    allowCsvExport: true,
    allowCloudSync: true,
  },
  STANDARD: {
    id: "standard",
    name: "STANDARD",
    monthlyPrice: 299,
    annualPriceMonthly: 239,
    maxBorrowers: 250,
    allowSms: true,
    allowCustomPdf: true,
    allowCsvExport: true,
    allowCloudSync: true,
  },
  PREMIUM: {
    id: "premium",
    name: "PREMIUM",
    monthlyPrice: 499,
    annualPriceMonthly: 399,
    maxBorrowers: 999999,
    allowSms: true,
    allowCustomPdf: true,
    allowCsvExport: true,
    allowCloudSync: true,
    prioritySupport: true,
  },
};

export default class SubscriptionService {
  constructor(subscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository;
  }

  getPlans() {
    return Object.values(PLANS);
  }

  async getCurrentSubscription(userId) {
    const active = await this.subscriptionRepository.findActiveByUserId(userId);

    if (!active) {
      return {
        plan: "FREE",
        status: "active",
        billing_cycle: "monthly",
        is_free: true,
        limits: PLANS.FREE,
        start_date: null,
        end_date: null,
      };
    }

    const planKey = (active.plan || "FREE").toUpperCase();
    const planConfig = PLANS[planKey] || PLANS.FREE;

    return {
      ...active,
      is_free: planKey === "FREE",
      limits: planConfig,
    };
  }

  async subscribe(userId, { plan, billing_cycle = "monthly", payment_method = "GCASH", payment_reference }) {
    const normalizedPlan = (plan || "").toUpperCase();
    if (!PLANS[normalizedPlan]) {
      throw new AppError(`Invalid plan: ${plan}. Must be BASIC, STANDARD, or PREMIUM.`, 400, "INVALID_PLAN");
    }

    const planConfig = PLANS[normalizedPlan];
    const isAnnual = (billing_cycle || "").toLowerCase() === "annual";
    const amount = isAnnual
      ? planConfig.annualPriceMonthly * 12
      : planConfig.monthlyPrice;

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await this.subscriptionRepository.createSubscription({
      userId,
      plan: normalizedPlan,
      billingCycle: isAnnual ? "annual" : "monthly",
      status: "active",
      amount,
      paymentMethod: payment_method || "GCASH",
      paymentReference: payment_reference || `REF_${Date.now()}`,
      startDate,
      endDate,
    });

    return {
      ...subscription,
      limits: planConfig,
    };
  }

  async cancel(userId) {
    const cancelled = await this.subscriptionRepository.cancelSubscription(userId);
    if (!cancelled) {
      throw new AppError("No active subscription found to cancel", 404, "NOT_FOUND");
    }
    return cancelled;
  }
}
