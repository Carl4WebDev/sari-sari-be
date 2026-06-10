import AppError from "../../../core/errors/AppError.js";
import { env } from "../../../core/config/env.js";

const SEMAPHORE_URL = "https://api.semaphore.co/api/v4/messages";
const PHONE_REGEX = /^(09|\+639)\d{9}$/;
const MAX_MESSAGE_LENGTH = 160;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function normalizePhone(phone) {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (trimmed.startsWith("+639")) {
    return "09" + trimmed.slice(4);
  }
  if (/^09\d{9}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function sanitizeMessage(msg) {
  return msg
    .replace(/<[^>]*>/g, "") // strip HTML
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

export default class SmsService {
  constructor(smsRepo) {
    this.smsRepo = smsRepo;
  }

  async sendReminderSms({ userId, borrowerId, reminderId, firstName, storeName, amount, dueDate, phoneNumber }) {
    // Validate phone
    const normalizedPhone = normalizePhone(phoneNumber);
    if (!normalizedPhone) {
      throw new AppError("Invalid Philippine phone number format", 400, "INVALID_PHONE");
    }

    // Rate limit check
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recentCount = await this.smsRepo.countRecentSms(userId, since);
    if (recentCount >= RATE_LIMIT) {
      throw new AppError("SMS rate limit exceeded (10 per hour). Try again later.", 429, "SMS_RATE_LIMITED");
    }

    // Build message
    const rawMessage = `Hi ${firstName}, your balance at ${storeName} is P${Number(amount).toLocaleString()}. Please settle by ${dueDate}. Thank you!`;
    const message = sanitizeMessage(rawMessage);

    // Check env
    if (!env.semaphoreApiKey) {
      throw new AppError("SMS service not configured", 500, "SMS_NOT_CONFIGURED");
    }

    // Send via Semaphore API
    let smsStatus = "Sent";
    let semaphoreMessageId = null;

    try {
      const response = await fetch(SEMAPHORE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: env.semaphoreApiKey,
          number: normalizedPhone,
          message: message,
        }),
      });

      // Check for non-OK responses before parsing JSON
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch {
          errorText = `HTTP ${response.status}`;
        }
        console.error(`[SMS] Semaphore API error: ${response.status} - ${errorText}`);
        smsStatus = "Failed";
      } else {
        // Parse JSON response
        const data = await response.json();
        if (data && data.length > 0 && data[0].message_id) {
          semaphoreMessageId = data[0].message_id;
        } else {
          smsStatus = "Failed";
          console.error("[SMS] Semaphore API returned unexpected response:", data);
        }
      }
    } catch (err) {
      smsStatus = "Failed";
      console.error("[SMS] Semaphore API request failed:", err.message);
    }

    // Log to DB (never let logging failure block the response)
    try {
      await this.smsRepo.logSms({
        userId,
        borrowerId,
        reminderId,
        recipientNumber: normalizedPhone,
        message,
        status: smsStatus,
        semaphoreMessageId,
      });
    } catch (logErr) {
      console.error("[SMS] Failed to log SMS to database:", logErr.message);
    }

    return { status: smsStatus, recipientNumber: normalizedPhone };
  }
}
