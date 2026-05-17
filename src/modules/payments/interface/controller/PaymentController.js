import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import BorrowerRepo from "../../../borrowers/infrastructure/BorrowerRepo.js";
import PaymentRepo from "../../infrastructure/PaymentRepo.js";
import PaymentService from "../../application/PaymentService.js";

const borrowerRepo = new BorrowerRepo();
const paymentRepository = new PaymentRepo();
const paymentService = new PaymentService(paymentRepository, borrowerRepo);

export const createPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await paymentService.createPayment(req.body, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Payment recorded successfully",
    data: result,
  });
});
