import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import PublicStatusRepo from "../../infrastructure/PublicStatusRepo.js";
import PublicStatusService from "../../application/PublicStatusService.js";

const publicStatusRepo = new PublicStatusRepo();
const publicStatusService = new PublicStatusService(publicStatusRepo);

export const getPublicStatus = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await publicStatusService.getStatusByToken(token);

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");

  return sendSuccess(res, {
    statusCode: 200,
    message: "Public status fetched",
    data: result,
  });
});
