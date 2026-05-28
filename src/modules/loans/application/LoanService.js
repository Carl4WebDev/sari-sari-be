import AppError from "../../../core/errors/AppError.js";

export default class LoanService {
  constructor(loanRepo, borrowerRepo) {
    this.loanRepo = loanRepo;
    this.borrowerRepo = borrowerRepo;
  }

  async createLoan(data, userId) {
    const { borrower_id, items } = data;

    if (!borrower_id) {
      throw new Error("Borrower is required");
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

    const itemsWithSubtotal = items.map((i) => ({
      product_name: i.product_name,
      product_id: i.product_id || null,
      quantity: i.quantity,
      price: i.price,
      subtotal: i.quantity * i.price,
    }));

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
