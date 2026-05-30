import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";
import db from "../../../../core/database/db.js";

import CollectionReminderRepo from "../../infrastructure/CollectionReminderRepo.js";
import CollectionReminderService from "../../application/CollectionReminderService.js";
import SmsRepo from "../../../sms/infrastructure/SmsRepo.js";
import SmsService from "../../../sms/application/SmsService.js";

const reminderRepo = new CollectionReminderRepo();
const reminderService = new CollectionReminderService(reminderRepo);
const smsRepo = new SmsRepo();
const smsService = new SmsService(smsRepo);

export const createReminder = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await reminderService.createReminder(req.body, userId);

  // Auto-send SMS if requested
  if (req.body.send_sms && result.borrower_id) {
    try {
      const borrowerResult = await db.query(
        `SELECT first_name, contact_number FROM borrowers WHERE borrower_id = $1 AND user_id = $2`,
        [result.borrower_id, userId],
      );
      const borrower = borrowerResult.rows[0];

      const userResult = await db.query(
        `SELECT store_name FROM users WHERE user_id = $1`,
        [userId],
      );
      const storeName = userResult.rows[0]?.store_name || "Store";

      if (borrower?.contact_number) {
        const dueDate = new Date(result.due_date).toLocaleDateString("en-PH", {
          timeZone: "Asia/Manila",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        await smsService.sendReminderSms({
          userId,
          borrowerId: result.borrower_id,
          reminderId: result.reminder_id,
          firstName: borrower.first_name,
          storeName,
          amount: result.amount_expected,
          dueDate,
          phoneNumber: borrower.contact_number,
        });
      }
    } catch {
      // SMS failure should not block reminder creation
    }
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: "Reminder created",
    data: result,
  });
});

export const getBorrowerReminders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { borrowerId } = req.params;

  const result = await reminderService.getBorrowerReminders(borrowerId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrower reminders fetched",
    data: result,
  });
});

export const getDashboardReminders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await reminderService.getDashboardReminders(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Dashboard reminders fetched",
    data: result,
  });
});

export const updateReminderStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reminderId } = req.params;
  const { status } = req.body;

  const result = await reminderService.updateReminderStatus(
    reminderId,
    userId,
    status,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Reminder status updated",
    data: result,
  });
});

export const remindAgain = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reminderId } = req.params;

  const result = await reminderService.recreateReminder(reminderId, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Reminder recreated for 3 days from now",
    data: result,
  });
});

export const deleteReminder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reminderId } = req.params;

  const result = await reminderService.deleteReminder(reminderId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Reminder deleted",
    data: result,
  });
});
