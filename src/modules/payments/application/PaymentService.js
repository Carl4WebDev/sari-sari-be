import Payment from "../domain/Payment.js";
import AppError from "../../../core/errors/AppError.js";

export default class PaymentService {
  constructor(paymentRepo, borrowerRepo) {
    this.paymentRepo = paymentRepo;
    this.borrowerRepo = borrowerRepo;
  }

  async createPayment(data, userId) {
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
