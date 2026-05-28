import { sendSuccess } from "../../../../core/http/apiResponse.js";
import { asyncHandler } from "../../../../core/middleware/asyncHandler.js";

import BorrowerRepo from "../../infrastructure/BorrowerRepo.js";
import BorrowerService from "../../application/BorrowerService.js";

const borrowerRepository = new BorrowerRepo();
const borrowerService = new BorrowerService(borrowerRepository);

export const createBorrower = asyncHandler(async (req, res) => {
  const userId = req.user.id;

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

  const imageUrl = `/uploads/borrowers/${req.file.filename}`;

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

// export const updatePublicAccess = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const borrowerId = req.params.id;

//   const { enabled } = req.body;
//   const result = await borrowerService.updatePublicAccess(
//     borrowerId,
//     enabled,
//     userId,
//   );

//   return sendSuccess(res, {
//     statusCode: 200,
//     message: "Public access updated",
//     data: result,
//   });
// });

export const archiveBorrower = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const borrowerId = req.params.id;

  const result = await borrowerService.archiveBorrower(borrowerId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrower archived",
    data: result,
  });
});

export const updatePublicLoanAccess = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const borrowerId = req.params.id;

  const enabled = req.body.enabled === true || req.body.enabled === "true";

  const result = await borrowerService.updatePublicLoanAccess(
    borrowerId,
    enabled,
    userId,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Public loan access updated",
    data: result,
  });
});

export const getArchivedBorrowers = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await borrowerService.getArchivedBorrowers(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Archived borrowers fetched",
    data: result,
  });
});

export const reactivateBorrower = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const borrowerId = req.params.id;

  const result = await borrowerService.reactivateBorrower(borrowerId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrower reactivated",
    data: result,
  });
});

export const createBorrowerNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { borrowerId } = req.params;
  const { note_text } = req.body;

  const note = await borrowerService.createNote(borrowerId, note_text, userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Note created",
    data: note,
  });
});

export const getBorrowerNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { borrowerId } = req.params;

  const notes = await borrowerService.getBorrowerNotes(borrowerId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Borrower notes fetched",
    data: notes,
  });
});

export const updateBorrowerNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { borrowerId, noteId } = req.params;
  const { note_text } = req.body;

  const note = await borrowerService.updateNote(borrowerId, noteId, note_text, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Note updated",
    data: note,
  });
});

export const deleteBorrowerNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { borrowerId, noteId } = req.params;

  const note = await borrowerService.deleteNote(borrowerId, noteId, userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Note deleted",
    data: note,
  });
});
