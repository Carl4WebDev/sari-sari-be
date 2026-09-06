export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN deleted_at timestamptz;
    CREATE TABLE admin_sessions (
      token_hash char(64) PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(user_id),
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX admin_sessions_user ON admin_sessions(user_id);
  `);
}
export async function down(pgm) {
  pgm.sql('DROP TABLE admin_sessions; ALTER TABLE users DROP COLUMN deleted_at;');
}
