import AppError from "../../../core/errors/AppError.js";

export const PLANS = {
  FREE: {
    id: "free",
    name: "FREE",
    monthlyPrice: 0,
    maxBorrowers: 999999,
    allowSms: false,
    allowCustomPdf: false,
    allowCsvExport: false,
    allowCloudSync: false,
    prioritySupport: false,
  },
  PREMIUM: {
    id: "premium",
    name: "PREMIUM",
    monthlyPrice: 299,
    annualDiscount: 0.10,
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
}
