import rateLimit from "express-rate-limit";

// 10 SMS per hour per user
export const smsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  keyGenerator: (req) => {
    // Rate limit by authenticated user ID
    return String(req.user?.id || "anon");
  },
  message: {
    ok: false,
    message: "SMS rate limit reached (10 per hour). Try again later.",
    code: "SMS_RATE_LIMIT",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
