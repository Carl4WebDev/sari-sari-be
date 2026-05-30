import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";
import { vapidPublicKey } from "../../../../core/push/vapidKeys.js";

import PushSubscriptionRepo from "../../infrastructure/PushSubscriptionRepo.js";
import PushService from "../../application/PushService.js";

const pushRepo = new PushSubscriptionRepo();
const pushService = new PushService(pushRepo);

export const subscribe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  await pushService.subscribe(userId, { endpoint, keys });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Push subscription saved",
  });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: "Endpoint required" });
  }

  await pushService.unsubscribe(userId, endpoint);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Push subscription removed",
  });
});

export const getVapidKey = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    data: { vapidPublicKey },
  });
});
