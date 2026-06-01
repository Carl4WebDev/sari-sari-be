import ExpenseRepo from "../../infrastructure/ExpenseRepo.js";
import ExpenseService from "../../application/ExpenseService.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";
import { sendSuccess } from "../../../../core/http/apiResponse.js";

const expenseRepo = new ExpenseRepo();
const expenseService = new ExpenseService(expenseRepo);

export const createExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const expense = await expenseService.createExpense(userId, req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Expense recorded",
    data: expense,
  });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
  const year = req.query.year ? parseInt(req.query.year, 10) : undefined;

  const expenses = await expenseService.getExpenses(userId, { month, year });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Expenses fetched",
    data: expenses,
  });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const expenseId = parseInt(req.params.id, 10);

  const expense = await expenseService.updateExpense(expenseId, userId, req.body);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Expense updated",
    data: expense,
  });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const expenseId = parseInt(req.params.id, 10);

  await expenseService.deleteExpense(expenseId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Expense deleted",
  });
});
