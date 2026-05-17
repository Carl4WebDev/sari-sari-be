export default class Payment {
  constructor({ borrower_id, amount, payment_type, note, user_id }) {
    this.borrower_id = borrower_id;
    this.amount = amount;
    this.payment_type = payment_type || "CASH";
    this.note = note || null;
    this.user_id = user_id;
  }
}
