import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import LoanRepo from "../../infrastructure/LoanRepo.js";
import LoanService from "../../application/LoanService.js";

const loanRepository = new LoanRepo();
const loanService = new LoanService(loanRepository);

export const createLoan = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log(req.body);

  const result = await loanService.createLoan(req.body, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Loan created",
    data: result,
  });
});
