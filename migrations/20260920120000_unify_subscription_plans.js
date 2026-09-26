export async function up(pgm) {
  // 1. Drop old self-serve subscriptions table if it exists
  pgm.sql(`DROP TABLE IF EXISTS subscriptions;`);

  // 2. Add is_admin to users if not present
  pgm.sql(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_admin') THEN
      ALTER TABLE users ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
    END IF;
  END $$;`);

  // 3. Create user_subscription table if not exists (production schema)
  pgm.sql(`CREATE TABLE IF NOT EXISTS user_subscription (
    subscription_id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(user_id),
    plan text NOT NULL CHECK (plan IN ('free', 'premium')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date date NOT NULL,
    end_date date NOT NULL CHECK (end_date > start_date),
    UNIQUE(user_id)
  );`);

  // 4. If the table already existed with old constraints, update them
  pgm.sql(`DO $$ BEGIN
    ALTER TABLE user_subscription DROP CONSTRAINT IF EXISTS user_subscription_plan_check;
    ALTER TABLE user_subscription ADD CONSTRAINT user_subscription_plan_check CHECK (plan IN ('free', 'premium'));
  EXCEPTION WHEN undefined_table THEN NULL;
  END $$;`);

  pgm.sql(`DO $$ BEGIN
    ALTER TABLE user_subscription DROP CONSTRAINT IF EXISTS user_subscription_status_check;
    ALTER TABLE user_subscription ADD CONSTRAINT user_subscription_status_check CHECK (status IN ('active', 'expired', 'cancelled'));
  EXCEPTION WHEN undefined_table THEN NULL;
  END $$;`);

  // 5. Create subscription_payments table if not exists
  pgm.sql(`CREATE TABLE IF NOT EXISTS subscription_payments (
    payment_id serial PRIMARY KEY,
    subscription_id integer NOT NULL REFERENCES user_subscription(subscription_id),
    user_id integer NOT NULL REFERENCES users(user_id),
    plan text NOT NULL CHECK (plan IN ('free', 'premium')),
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    payment_method text NOT NULL CHECK (payment_method IN ('GCash', 'Maya', 'Bank Transfer', 'Cash', 'Other')),
    reference_number varchar(120) NOT NULL,
    payment_date date NOT NULL,
    duration integer NOT NULL CHECK (duration IN (1, 3, 6, 12)),
    verified_by integer NOT NULL REFERENCES users(user_id),
    notes varchar(1000) NOT NULL DEFAULT '',
    UNIQUE(payment_method, reference_number)
  );`);

  // 6. If subscription_payments existed with old constraints, update them
  pgm.sql(`DO $$ BEGIN
    ALTER TABLE subscription_payments DROP CONSTRAINT IF EXISTS subscription_payments_plan_check;
    ALTER TABLE subscription_payments ADD CONSTRAINT subscription_payments_plan_check CHECK (plan IN ('free', 'premium'));
  EXCEPTION WHEN undefined_table THEN NULL;
  END $$;`);

  // 7. Update old plan values if any exist
  pgm.sql(`UPDATE user_subscription SET plan = 'premium' WHERE plan IN ('basic', 'standard');`);
  pgm.sql(`UPDATE subscription_payments SET plan = 'premium' WHERE plan IN ('basic', 'standard');`);
}

export async function down(pgm) {
  pgm.dropTable('subscription_payments');
  pgm.dropTable('user_subscription');
}
