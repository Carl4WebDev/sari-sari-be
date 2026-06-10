import Payment from "../domain/Payment.js";
import AppError from "../../../core/errors/AppError.js";

export default class PaymentService {
  constructor(paymentRepo, borrowerRepo) {
    this.paymentRepo = paymentRepo;
    this.borrowerRepo = borrowerRepo;
  }

  async createPayment(data, userId) {
    if (!data.amount || typeof data.amount !== "number" || data.amount <= 0) {
      throw new AppError("Payment amount must be a positive number", 400);
    }

    if (!data.borrower_id) {
      throw new AppError("Borrower is required", 400);
    }

    const borrowerId = Number(data.borrower_id);

    if (!Number.isFinite(borrowerId) || !Number.isInteger(borrowerId)) {
      throw new AppError("Invalid borrower ID", 400, "INVALID_BORROWER_ID");
    }

    if (borrowerId > 2147483647 || borrowerId < 0) {
      throw new AppError("Invalid borrower ID", 400, "INVALID_BORROWER_ID");
    }

    if (data.note && typeof data.note === "string" && data.note.length > 1000) {
      throw new AppError("Note must not exceed 1000 characters", 400);
    }

    const validMethods = ["CASH", "GCASH", "CREDIT_CARD", "DEBIT_CARD"];
    if (data.payment_type && !validMethods.includes(data.payment_type)) {
      throw new AppError("Invalid payment method", 400);
    }

    const borrower = await this.borrowerRepo.findByIdAndUserId(
      borrowerId,
      userId,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    const payment = new Payment({
      borrower_id: borrowerId,
      amount: data.amount,
      payment_type: data.payment_type,
      note: data.note,
      user_id: userId,
    });

    try {
      return await this.paymentRepo.create(payment);
    } catch (err) {
      if (err.message === "BALANCE_EXCEEDED") {
        throw new AppError("Payment exceeds remaining balance", 400);
      }
      throw err;
    }
  }
}
