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

    const borrower = await this.borrowerRepo.findByIdAndUserId(
      data.borrower_id,
      userId,
    );

    if (!borrower) {
      throw new AppError("Borrower not found", 404, "BORROWER_NOT_FOUND");
    }

    const balance = await this.borrowerRepo.getBorrowerBalance(
      data.borrower_id,
    );

    if (data.amount > balance) {
      throw new AppError("Payment exceeds remaining balance", 400);
    }

    const payment = new Payment({
      borrower_id: data.borrower_id,
      amount: data.amount,
      payment_type: data.payment_type,
      note: data.note,
      user_id: userId,
    });

    return await this.paymentRepo.create(payment);
  }
}
