export default class Borrower {
  constructor({
    borrower_id,
    user_id,
    first_name,
    middle_name,
    last_name,
    dob,
    contact_number,
    email,
  }) {
    this.borrower_id = borrower_id;
    this.user_id = user_id;
    this.first_name = first_name;
    this.middle_name = middle_name;
    this.last_name = last_name;
    this.dob = dob;
    this.contact_number = contact_number;
    this.email = email;
  }
}
