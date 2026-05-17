export default class User {
  constructor({ user_id, email, password_hash, store_name }) {
    this.user_id = user_id;
    this.email = email;
    this.password_hash = password_hash;
    this.store_name = store_name;
  }
}
