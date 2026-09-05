import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";
import SubscriptionRepo from "../../infrastructure/SubscriptionRepo.js";
import SubscriptionService from "../../application/SubscriptionService.js";

const subscriptionRepo = new SubscriptionRepo();
const subscriptionService = new SubscriptionService(subscriptionRepo);

export const getPlans = asyncHandler(async (req, res) => {
  const plans = subscriptionService.getPlans();
  return sendSuccess(res, {
    statusCode: 200,
    message: "Plans fetched successfully",
    data: plans,
  });
});

export const getCurrentSubscription = asyncHandler(async (req, res) => {
  const current = await subscriptionService.getCurrentSubscription(req.user.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: "Subscription details fetched",
    data: current,
  });
});

export const subscribe = asyncHandler(async (req, res) => {
  const result = await subscriptionService.subscribe(req.user.id, req.body);
  return sendSuccess(res, {
    statusCode: 200,
    message: `Successfully subscribed to ${result.plan} plan!`,
    data: result,
  });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.cancel(req.user.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: "Subscription cancelled successfully",
    data: result,
  });
});
