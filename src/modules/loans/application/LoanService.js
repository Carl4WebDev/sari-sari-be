export default class LoanService {
  constructor(loanRepo) {
    this.loanRepo = loanRepo;
  }

  async createLoan(data, userId) {
    const { borrower_id, items } = data;

    if (!borrower_id) {
      throw new Error("Borrower is required");
    }

    if (!items || items.length === 0) {
      throw new Error("Loan must contain items");
    }

    const itemsWithSubtotal = items.map((i) => ({
      product_name: i.product_name,
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
