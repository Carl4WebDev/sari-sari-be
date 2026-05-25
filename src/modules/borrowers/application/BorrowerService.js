import Borrower from "../domain/Borrower.js";
import AppError from "../../../core/errors/AppError.js";
import ValidationError from "../../../core/errors/ValidationError.js";
import {
  validateBorrowerInput,
  validateBorrowerNoteInput,
} from "./validators/borrowerValidator.js";

export default class BorrowerService {
  constructor(borrowerRepo) {
    this.borrowerRepo = borrowerRepo;
  }

  async createBorrower(data, userId) {
    const validatedData = validateBorrowerInput(data);

    const borrower = new Borrower({
      user_id: userId,
      first_name: validatedData.first_name.toUpperCase(),
      middle_name: validatedData.middle_name
        ? validatedData.middle_name.toUpperCase()
        : null,
      last_name: validatedData.last_name.toUpperCase(),
      dob: validatedData.dob,
      contact_number: validatedData.contact_number,
    });

    return await this.borrowerRepo.create(borrower);
  }

  async getBorrowers(userId) {
    const borrowers = await this.borrowerRepo.findAllByUserId(userId);

    if (!borrowers.length) return [];

    const borrowerIds = borrowers.map((b) => b.borrower_id);

    const loanTotals =
      await this.borrowerRepo.getTotalLoanByBorrowerIds(borrowerIds);

    const loanMap = new Map(
      loanTotals.map((l) => [l.borrower_id, Number(l.total_loan)]),
    );

    return borrowers.map((b) => ({
      ...b,
      first_name: b.first_name?.toUpperCase(),
      middle_name: b.middle_name?.toUpperCase(),
      last_name: b.last_name?.toUpperCase(),
      total_loan: loanMap.get(b.borrower_id) || 0,
    }));
  }

  async getBorrowerTransactions(borrowerId, userId) {
    const borrower = await this.borrowerRepo.findByIdAndUserId(
      borrowerId,
      userId,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    const transactions =
      await this.borrowerRepo.findTransactionsByBorrowerId(borrowerId);

    if (!transactions.length) return [];

    const transactionIds = transactions.map((t) => t.transaction_id);

    const loanItems =
      await this.borrowerRepo.findLoanItemsByTransactionIds(transactionIds);

    const itemsMap = new Map();

    loanItems.forEach((item) => {
      if (!itemsMap.has(item.transaction_id)) {
        itemsMap.set(item.transaction_id, []);
      }

      itemsMap.get(item.transaction_id).push(item);
    });

    return transactions.map((t) => ({
      ...t,
      items: itemsMap.get(t.transaction_id) || [],
    }));
  }

  async uploadBorrowerProfileImage(borrowerId, userId, imageUrl) {
    if (!borrowerId) {
      throw new ValidationError("Borrower ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (!imageUrl) {
      throw new ValidationError("Profile image is required");
    }

    const borrower = await this.borrowerRepo.updateBorrowerProfileImage(
      borrowerId,
      userId,
      imageUrl,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    return borrower;
  }

  async updatePublicLoanAccess(borrowerId, enabled, userId) {
    return await this.borrowerRepo.updatePublicLoanAccess(
      borrowerId,
      Boolean(enabled),
      userId,
    );
  }

  async archiveBorrower(borrowerId, userId) {
    const borrower = await this.borrowerRepo.archiveBorrower(
      borrowerId,
      userId,
    );

    if (!borrower) {
      throw new AppError(
        "Cannot archive borrower with unpaid balance",
        400,
        "BORROWER_HAS_BALANCE",
      );
    }

    return borrower;
  }

  async getArchivedBorrowers(userId) {
    return await this.borrowerRepo.findArchivedByUserId(userId);
  }

  async reactivateBorrower(borrowerId, userId) {
    const borrower = await this.borrowerRepo.reactivateBorrower(
      borrowerId,
      userId,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    return borrower;
  }

  async createNote(borrowerId, noteText) {
    const validatedNote = validateBorrowerNoteInput(noteText);

    return await this.borrowerRepo.createNote(borrowerId, validatedNote);
  }

  async getBorrowerNotes(borrowerId) {
    return await this.borrowerRepo.getNotesByBorrowerId(borrowerId);
  }

  async updateNote(borrowerId, noteId, noteText) {
    const validatedNote = validateBorrowerNoteInput(noteText);

    return await this.borrowerRepo.updateNote(
      noteId,
      borrowerId,
      validatedNote,
    );
  }

  async deleteNote(borrowerId, noteId) {
    return await this.borrowerRepo.deleteNote(noteId, borrowerId);
  }

  async updatePublicTokenExpiration(borrowerId, userId, expiresAt) {
    if (!borrowerId) {
      throw new ValidationError("Borrower ID is required");
    }

    const borrower = await this.borrowerRepo.updatePublicTokenExpiration(
      borrowerId,
      userId,
      expiresAt,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    return borrower;
  }
}
