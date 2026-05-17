import IUserRepo from "../domain/Users/IUserRepo.js";
import db from "../../../core/database/db.js";
import User from "../domain/Users/User.js";

export default class UserRepo extends IUserRepo {
  async create(user) {
    const result = await db.query(
      `INSERT INTO users (email, password_hash, store_name)
       VALUES ($1, $2, $3)
       RETURNING user_id, email, store_name`,
      [user.email, user.password_hash, user.store_name],
    );

    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (!result.rows[0]) return null;

    return new User(result.rows[0]);
  }
}
