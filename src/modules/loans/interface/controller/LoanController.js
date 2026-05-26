import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import LoanRepo from "../../infrastructure/LoanRepo.js";
import LoanService from "../../application/LoanService.js";
import BorrowerRepo from "../../../borrowers/infrastructure/BorrowerRepo.js";

const loanRepository = new LoanRepo();
const borrowerRepository = new BorrowerRepo();
const loanService = new LoanService(loanRepository, borrowerRepository);

export const createLoan = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await loanService.createLoan(req.body, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Loan created",
    data: result,
  });
});
