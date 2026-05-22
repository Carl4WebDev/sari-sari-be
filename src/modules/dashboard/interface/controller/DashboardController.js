import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import DashboardRepo from "../../infrastructure/DashboardRepo.js";
import DashboardService from "../../application/DashboardService.js";

const dashboardRepo = new DashboardRepo();
const dashboardService = new DashboardService(dashboardRepo);

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await dashboardService.getDashboard(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Dashboard fetched",
    data: result,
  });
});
