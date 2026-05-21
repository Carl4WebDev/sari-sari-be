import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import BorrowerRepo from "../../infrastructure/BorrowerRepo.js";
import BorrowerService from "../../application/BorrowerService.js";

const borrowerRepository = new BorrowerRepo();
const borrowerService = new BorrowerService(borrowerRepository);

export const createBorrower = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  const result = await borrowerService.createBorrower(req.body, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Borrower created",
    data: result,
  });
});

export const getBorrowers = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const borrowers = await borrowerService.getBorrowers(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrowers fetched",
    data: borrowers,
  });
});

export const getBorrowerTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const borrowerId = req.params.id;
  console.log(userId);
  console.log(borrowerId);

  const transactions = await borrowerService.getBorrowerTransactions(
    borrowerId,
    userId,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrower transactions fetched",
    data: transactions,
  });
});

export const uploadBorrowerProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const borrowerId = req.params.borrowerId;

  if (!req.file) {
    throw new Error("Profile image is required");
  }

  const baseUrl = process.env.APP_URL;

  const imageUrl = `${baseUrl}/uploads/borrowers/${req.file.filename}`;

  const borrower = await borrowerService.uploadBorrowerProfileImage(
    borrowerId,
    userId,
    imageUrl,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrower profile image uploaded successfully",
    data: borrower,
  });
});
