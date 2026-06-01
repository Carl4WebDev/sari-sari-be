import AppError from "../../../core/errors/AppError.js";
import ValidationError from "../../../core/errors/ValidationError.js";

const VALID_CATEGORIES = ["RESTOCK", "UTILITIES", "RENT", "SALARY", "TRANSPORT", "SUPPLIES", "OTHER"];

class ExpenseService {
  constructor(expenseRepo) {
    this.expenseRepo = expenseRepo;
  }

  _validate(data) {
    const errors = {};

    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }

    if (data.amount && Number(data.amount) > 999999.99) {
      errors.amount = "Amount cannot exceed 999,999.99";
    }

    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      errors.category = `Category must be one of: ${VALID_CATEGORIES.join(", ")}`;
    }

    if (data.description && data.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (!data.expense_date || isNaN(Date.parse(data.expense_date))) {
      errors.expense_date = "A valid date is required";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Invalid expense data", errors);
    }

    return {
      amount: Number(data.amount),
      category: data.category,
      description: data.description?.trim() || null,
      expense_date: data.expense_date,
    };
  }

  async createExpense(userId, data) {
    const validated = this._validate(data);
    return await this.expenseRepo.create(userId, validated);
  }

  async getExpenses(userId, { month, year } = {}) {
    return await this.expenseRepo.findAllByUserId(userId, { month, year });
  }

  async updateExpense(expenseId, userId, data) {
    const existing = await this.expenseRepo.findById(expenseId, userId);
    if (!existing) {
      throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }

    const validated = this._validate(data);
    return await this.expenseRepo.update(expenseId, userId, validated);
  }

  async deleteExpense(expenseId, userId) {
    const existing = await this.expenseRepo.findById(expenseId, userId);
    if (!existing) {
      throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }

    return await this.expenseRepo.delete(expenseId, userId);
  }
}

export default ExpenseService;
