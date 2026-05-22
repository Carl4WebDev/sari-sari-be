import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import CollectionReminderRepo from "../../infrastructure/CollectionReminderRepo.js";
import CollectionReminderService from "../../application/CollectionReminderService.js";

const reminderRepo = new CollectionReminderRepo();
const reminderService = new CollectionReminderService(reminderRepo);

export const createReminder = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await reminderService.createReminder(req.body, userId);

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
