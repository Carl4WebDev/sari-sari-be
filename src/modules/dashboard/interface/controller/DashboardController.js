import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import DashboardRepo from "../../infrastructure/DashboardRepo.js";
import DashboardService from "../../application/DashboardService.js";
import ExpenseRepo from "../../../expenses/infrastructure/ExpenseRepo.js";

const dashboardRepo = new DashboardRepo();
const expenseRepo = new ExpenseRepo();
const dashboardService = new DashboardService(dashboardRepo, expenseRepo);

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await dashboardService.getDashboard(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Dashboard fetched",
    data: result,
  });
});

export const getCalendarData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  const result = await dashboardService.getCalendarData(userId, year, month);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Calendar data fetched",
    data: result,
  });
});

export const getCollectionStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period } = req.query;

  const result = await dashboardService.getCollectionStats(
    userId,
    period || "week",
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Collection stats fetched",
    data: result,
  });
});

export const getCollectionTrend = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await dashboardService.getCollectionTrend(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Collection trend fetched",
    data: result,
  });
});

export const getIncomeSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const period = req.query.period || "month";

  const result = await dashboardService.getIncomeSummary(userId, period);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Income summary fetched",
    data: result,
  });
});

export const getToday = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await dashboardService.getTodaySummary(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Today summary fetched",
    data: result,
  });
});
