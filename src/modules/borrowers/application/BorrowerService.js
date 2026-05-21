import Borrower from "../domain/Borrower.js";

export default class BorrowerService {
  constructor(borrowerRepo) {
    this.borrowerRepo = borrowerRepo;
  }

  async createBorrower(data, userId) {
    const borrower = new Borrower({
      user_id: userId,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      dob: data.dob,
      contact_number: data.contact_number,
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
      total_loan: loanMap.get(b.borrower_id) || 0,
    }));
  }

  async getBorrowerTransactions(borrowerId, userId) {
    // verify borrower ownership
    const borrower = await this.borrowerRepo.findByIdAndUserId(
      borrowerId,
      userId,
    );

    if (!borrower) {
      throw new Error("Borrower not found");
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
      throw new Error("Borrower ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!imageUrl) {
      throw new Error("Profile image is required");
    }

    const borrower = await this.borrowerRepo.updateBorrowerProfileImage(
      borrowerId,
      userId,
      imageUrl,
    );

    if (!borrower) {
      throw new Error("Borrower not found");
    }

    return borrower;
  }
}
