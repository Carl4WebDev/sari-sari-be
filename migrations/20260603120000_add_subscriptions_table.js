export async function up(pgm) {
  pgm.createTable("subscriptions", {
    subscription_id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    plan: {
      type: "varchar(50)",
      notNull: true,
      default: "FREE",
    },
    billing_cycle: {
      type: "varchar(20)",
      notNull: true,
      default: "monthly",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "active",
    },
    amount: {
      type: "numeric(12,2)",
      notNull: true,
      default: 0,
    },
    payment_method: {
      type: "varchar(50)",
      default: "GCASH",
    },
    payment_reference: {
      type: "varchar(100)",
    },
    start_date: {
      type: "timestamp",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    end_date: {
      type: "timestamp",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "timestamp",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("subscriptions", ["user_id", "status"], {
    name: "idx_subscriptions_user_status",
  });
}

export async function down(pgm) {
  pgm.dropTable("subscriptions");
}
