export async function up(pgm) {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
    CREATE TABLE user_subscription (
      subscription_id serial PRIMARY KEY,
      user_id integer NOT NULL UNIQUE REFERENCES users(user_id),
      plan text NOT NULL CHECK (plan IN ('basic','standard','premium')),
      status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled')),
      start_date date NOT NULL,
      end_date date NOT NULL CHECK (end_date > start_date)
    );
    CREATE TABLE subscription_payments (
      payment_id serial PRIMARY KEY,
      subscription_id integer NOT NULL REFERENCES user_subscription(subscription_id),
      user_id integer NOT NULL REFERENCES users(user_id),
      plan text NOT NULL CHECK (plan IN ('basic','standard','premium')),
      amount numeric(12,2) NOT NULL CHECK (amount > 0),
      payment_method text NOT NULL CHECK (payment_method IN ('GCash','Other')),
      reference_number varchar(120) NOT NULL,
      payment_date date NOT NULL,
      duration integer NOT NULL CHECK (duration IN (1,3,6,12)),
      verified_by integer NOT NULL REFERENCES users(user_id),
      notes varchar(1000) NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(payment_method, reference_number)
    );
    CREATE INDEX subscription_payments_date ON subscription_payments(payment_date);
  `);
}
export async function down(pgm) {
  pgm.sql('DROP TABLE subscription_payments; DROP TABLE user_subscription; ALTER TABLE users DROP COLUMN is_admin;');
}
