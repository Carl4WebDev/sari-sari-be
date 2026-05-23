import ValidationError from "../../../core/errors/ValidationError.js";
import AppError from "../../../core/errors/AppError.js";

export default class CollectionReminderService {
  constructor(repo) {
    this.repo = repo;
  }

  async createReminder(data, userId) {
    if (!data.borrower_id || !data.due_date) {
      throw new ValidationError("Borrower and due date are required");
    }

    return await this.repo.create({
      user_id: userId,
      borrower_id: data.borrower_id,
      amount_expected: data.amount_expected || 0,
      due_date: data.due_date,
      note: data.note || null,
    });
  }

  async getBorrowerReminders(borrowerId, userId) {
    return await this.repo.findByBorrowerId(borrowerId, userId);
  }

  async getDashboardReminders(userId) {
    const reminders = await this.repo.findDashboardReminders(userId);

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });

    return {
      todays_collections: reminders.filter(
        (r) =>
          new Date(r.due_date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Manila",
          }) === today,
      ),
      overdue: reminders.filter(
        (r) =>
          new Date(r.due_date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Manila",
          }) < today,
      ),
      upcoming: reminders.filter(
        (r) =>
          new Date(r.due_date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Manila",
          }) > today,
      ),
    };
  }

  async updateReminderStatus(reminderId, userId, status) {
    if (!["PENDING", "DONE", "CANCELLED"].includes(status)) {
      throw new ValidationError("Invalid reminder status");
    }

    const reminder = await this.repo.updateStatus(reminderId, userId, status);

    if (!reminder) {
      throw new AppError("Reminder not found", 404, "REMINDER_NOT_FOUND");
    }

    return reminder;
  }

  async deleteReminder(reminderId, userId) {
    const reminder = await this.repo.delete(reminderId, userId);

    if (!reminder) {
      throw new AppError("Reminder not found", 404, "REMINDER_NOT_FOUND");
    }

    return reminder;
  }
}
