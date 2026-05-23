import pg from "pg";
import { env } from "../config/env.js"; // adjust path if needed

const { Pool } = pg;

const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      user: env.db.user,
      host: env.db.host,
      database: env.db.name,
      password: env.db.pass,
      port: env.db.port,
    });

class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = pool;
      Database.instance = this;
    }

    return Database.instance;
  }

  async query(text, params = []) {
    return this.pool.query(text, params);
  }

  async getClient() {
    return this.pool.connect();
  }

  async transaction(work) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await work(client);

      await client.query("COMMIT");

      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async end() {
    await this.pool.end();
  }
}

const db = new Database();
Object.freeze(db);

export default db;
