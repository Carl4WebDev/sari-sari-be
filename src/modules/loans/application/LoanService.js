import AppError from "../../../core/errors/AppError.js";

export default class LoanService {
  constructor(loanRepo, borrowerRepo) {
    this.loanRepo = loanRepo;
    this.borrowerRepo = borrowerRepo;
  }

  async createLoan(data, userId) {
    const { borrower_id: rawBorrowerId, items } = data;

    if (!rawBorrowerId) {
      throw new Error("Borrower is required");
    }

    // Coerce to number — handles string values from offline queue replay
    const borrower_id = Number(rawBorrowerId);

    if (!Number.isFinite(borrower_id) || !Number.isInteger(borrower_id)) {
      throw new AppError("Invalid borrower ID", 400, "INVALID_BORROWER_ID");
    }

    // Reject IDs that overflow PostgreSQL integer (max 2,147,483,647)
    if (borrower_id > 2147483647 || borrower_id < 0) {
      throw new AppError("Invalid borrower ID", 400, "INVALID_BORROWER_ID");
    }

    const borrower = await this.borrowerRepo.findByIdAndUserId(
      borrower_id,
      userId,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    if (!items || items.length === 0) {
      throw new Error("Loan must contain items");
    }

    if (items.length > 100) {
      throw new AppError("Too many items in a single loan", 400);
    }

    const itemsWithSubtotal = items.map((i) => {
      if (!i.product_name || typeof i.product_name !== "string") {
        throw new AppError("Each item must have a product name", 400);
      }
      if (typeof i.quantity !== "number" || i.quantity < 1 || !Number.isInteger(i.quantity)) {
        throw new AppError("Quantity must be a positive integer", 400);
      }
      if (typeof i.price !== "number" || i.price < 0) {
        throw new AppError("Price must be a non-negative number", 400);
      }
      // Coerce and reject product_id values that overflow PostgreSQL integer
      const product_id = i.product_id != null ? Number(i.product_id) : null;
      if (product_id != null && (!Number.isFinite(product_id) || !Number.isInteger(product_id) || product_id > 2147483647 || product_id < 0)) {
        throw new AppError("Invalid product ID", 400, "INVALID_PRODUCT_ID");
      }
      return {
        product_name: i.product_name,
        product_id: product_id || null,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.quantity * i.price,
      };
    });

    const totalAmount = itemsWithSubtotal.reduce(
      (sum, i) => sum + i.subtotal,
      0,
    );

    return await this.loanRepo.createLoanTransaction(
      borrower_id,
      userId,
      totalAmount,
      itemsWithSubtotal,
    );
  }
}
