import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";
import AppError from "../../../../core/errors/AppError.js";

import SmsRepo from "../../infrastructure/SmsRepo.js";
import SmsService from "../../application/SmsService.js";
import CollectionReminderRepo from "../../../collection_reminder/infrastructure/CollectionReminderRepo.js";
import db from "../../../../core/database/db.js";

const smsRepo = new SmsRepo();
const smsService = new SmsService(smsRepo);
const reminderRepo = new CollectionReminderRepo();

export const sendReminderSms = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reminderId } = req.body;

  if (!reminderId) {
    throw new AppError("reminderId is required", 400, "MISSING_REMINDER_ID");
  }

  // Fetch the reminder with borrower info
  const reminder = await reminderRepo.findById(reminderId, userId);
  if (!reminder) {
    throw new AppError("Reminder not found", 404, "REMINDER_NOT_FOUND");
  }

  // Fetch borrower contact info and store name
  const borrowerResult = await db.query(
    `SELECT first_name, contact_number FROM borrowers WHERE borrower_id = $1 AND user_id = $2`,
    [reminder.borrower_id, userId],
  );

  const borrower = borrowerResult.rows[0];
  if (!borrower) {
    throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
  }

  if (!borrower.contact_number) {
    throw new AppError("Borrower has no phone number", 400, "NO_PHONE_NUMBER");
  }

  // Get store name
  const userResult = await db.query(
    `SELECT store_name FROM users WHERE user_id = $1`,
    [userId],
  );
  const storeName = userResult.rows[0]?.store_name || "Store";

  // Format due date in Manila timezone
  const dueDate = new Date(reminder.due_date).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const result = await smsService.sendReminderSms({
    userId,
    borrowerId: reminder.borrower_id,
    reminderId,
    firstName: borrower.first_name,
    storeName,
    amount: reminder.amount_expected,
    dueDate,
    phoneNumber: borrower.contact_number,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: `SMS ${result.status.toLowerCase()}`,
    data: result,
  });
});
