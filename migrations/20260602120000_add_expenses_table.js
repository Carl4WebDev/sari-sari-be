export async function up(pgm) {
  pgm.createTable("expenses", {
    expense_id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    amount: {
      type: "numeric(12,2)",
      notNull: true,
    },
    category: {
      type: "varchar(50)",
      notNull: true,
      default: "OTHER",
    },
    description: { type: "text" },
    expense_date: {
      type: "date",
      notNull: true,
      default: pgm.func("CURRENT_DATE"),
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

  pgm.addConstraint("expenses", "expenses_amount_check", {
    check: "amount > 0",
  });

  pgm.createIndex("expenses", ["user_id", "expense_date"], {
    name: "idx_expenses_user_date",
  });
}

export async function down(pgm) {
  pgm.dropTable("expenses");
}
