export async function up(pgm) {
  // Composite index for active borrower queries per user
  pgm.addIndex("borrowers", ["user_id", "is_active"], {
    name: "idx_borrowers_user_active",
  });

  // Composite index for dashboard queries (loans/payments by user and date)
  pgm.addIndex("transactions", ["user_id", "type", "transaction_date"], {
    name: "idx_transactions_user_type_date",
  });

  // Composite index for borrower transaction lookups
  pgm.addIndex("transactions", ["borrower_id", "type"], {
    name: "idx_transactions_borrower_type",
  });

  // Index for loan item joins
  pgm.addIndex("loan_items", ["transaction_id"], {
    name: "idx_loan_items_transaction",
  });

  // Composite index for active products per user
  pgm.addIndex("product_master", ["user_id", "is_active"], {
    name: "idx_product_master_user_active",
  });

  // Index for collection reminder lookups
  pgm.addIndex("collection_reminders", ["user_id", "due_date", "status"], {
    name: "idx_reminders_user_due_status",
  });
};

export async function down(pgm) {
  pgm.dropIndex("borrowers", ["user_id", "is_active"], { name: "idx_borrowers_user_active" });
  pgm.dropIndex("transactions", ["user_id", "type", "transaction_date"], { name: "idx_transactions_user_type_date" });
  pgm.dropIndex("transactions", ["borrower_id", "type"], { name: "idx_transactions_borrower_type" });
  pgm.dropIndex("loan_items", ["transaction_id"], { name: "idx_loan_items_transaction" });
  pgm.dropIndex("product_master", ["user_id", "is_active"], { name: "idx_product_master_user_active" });
  pgm.dropIndex("collection_reminders", ["user_id", "due_date", "status"], { name: "idx_reminders_user_due_status" });
}
