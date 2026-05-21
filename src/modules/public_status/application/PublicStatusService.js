import NotFoundError from "../../../core/errors/NotFoundError.js";

export default class PublicStatusService {
  constructor(publicStatusRepo) {
    this.publicStatusRepo = publicStatusRepo;
  }

  async getStatusByToken(token) {
    if (!token) {
      throw new NotFoundError("Status page not found");
    }

    const borrower = await this.publicStatusRepo.findBorrowerByToken(token);

    if (!borrower) {
      throw new NotFoundError("Status page not found");
    }

    const transactions =
      await this.publicStatusRepo.findTransactionsByBorrowerId(
        borrower.borrower_id,
      );

    const totalBalance = transactions.reduce((sum, transaction) => {
      if (transaction.type === "LOAN") return sum + Number(transaction.amount);
      if (transaction.type === "PAYMENT")
        return sum - Number(transaction.amount);
      return sum;
    }, 0);

    const lastPayment = [...transactions]
      .reverse()
      .find((transaction) => transaction.type === "PAYMENT");

    return {
      store: {
        name: borrower.store_name,
      },
      borrower: {
        name: `${borrower.first_name} ${borrower.last_name}`,
        profile_image_url: borrower.profile_image_url,
      },
      summary: {
        total_balance: totalBalance,
        last_payment: lastPayment
          ? {
              amount: Number(lastPayment.amount),
              date: lastPayment.date,
            }
          : null,
      },
      transactions,
    };
  }
}
