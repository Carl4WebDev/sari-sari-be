/**
 * Initial Schema Migration
 * Extracted from pgAdmin backup of sarisari_db
 *
 * Tables: users, borrowers, transactions, loan_items,
 *         payment_details, borrower_notes, product_master,
 *         collection_reminders
 */

export async function up(pgm) {
  // Custom enum types
  pgm.createType("payment_method_type", [
    "CASH",
    "GCASH",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "CREDIT CARD",
    "DEBIT CARD",
  ]);

  pgm.createType("transaction_type", ["LOAN", "PAYMENT"]);

  // USERS
  pgm.createTable("users", {
    user_id: { type: "serial", primaryKey: true },
    email: { type: "varchar(255)", notNull: true, unique: true },
    password_hash: { type: "text", notNull: true },
    store_name: { type: "varchar(255)", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    updated_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
  });

  // BORROWERS
  pgm.createTable("borrowers", {
    borrower_id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    first_name: { type: "varchar(100)", notNull: true },
    middle_name: { type: "varchar(100)" },
    last_name: { type: "varchar(100)", notNull: true },
    dob: { type: "date" },
    contact_number: { type: "varchar(20)" },
    created_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    updated_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    is_active: { type: "boolean", default: true },
    public_token: { type: "varchar(255)", unique: true },
    token_enabled: { type: "boolean", default: false },
    profile_image_url: { type: "text" },
    public_token_expires_at: { type: "timestamp" },
  });

  pgm.createIndex("borrowers", "user_id", { name: "idx_borrowers_user_id" });

  // TRANSACTIONS (loans + payments)
  pgm.createTable("transactions", {
    transaction_id: { type: "serial", primaryKey: true },
    borrower_id: {
      type: "integer",
      notNull: true,
      references: "borrowers",
      onDelete: "CASCADE",
    },
    type: { type: "transaction_type", notNull: true },
    transaction_date: { type: "date", notNull: true },
    total_amount: { type: "numeric(12,2)", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    updated_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
  });

  pgm.createIndex("transactions", "borrower_id", {
    name: "idx_transactions_borrower_id",
  });
  pgm.createIndex("transactions", "transaction_date", {
    name: "idx_transactions_date",
  });
  pgm.createIndex("transactions", "type", {
    name: "idx_transactions_type",
  });

  // LOAN ITEMS
  pgm.createTable("loan_items", {
    loan_item_id: { type: "serial", primaryKey: true },
    transaction_id: {
      type: "integer",
      notNull: true,
      references: "transactions",
      onDelete: "CASCADE",
    },
    product_name: { type: "varchar(255)", notNull: true },
    quantity: { type: "integer", notNull: true },
    price: { type: "numeric(12,2)", notNull: true },
    subtotal: { type: "numeric(12,2)", notNull: true },
  });

  // PAYMENT DETAILS
  pgm.createTable("payment_details", {
    payment_detail_id: { type: "serial", primaryKey: true },
    transaction_id: {
      type: "integer",
      notNull: true,
      unique: true,
      references: "transactions",
      onDelete: "CASCADE",
    },
    payment_method: { type: "payment_method_type", notNull: true },
    note: { type: "text" },
  });

  // BORROWER NOTES
  pgm.createTable("borrower_notes", {
    borrower_note_id: { type: "serial", primaryKey: true },
    borrower_id: {
      type: "integer",
      notNull: true,
      references: "borrowers",
      onDelete: "CASCADE",
    },
    note_text: { type: "text", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
  });

  // PRODUCT MASTER
  pgm.createTable("product_master", {
    product_id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    product_name: { type: "varchar(255)", notNull: true },
    product_price: { type: "numeric(12,2)", notNull: true, default: 0 },
    is_active: { type: "boolean", notNull: true, default: true },
    created_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    updated_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
  });

  pgm.addConstraint("product_master", "product_master_user_id_product_name_key", {
    unique: ["user_id", "product_name"],
  });

  // COLLECTION REMINDERS
  pgm.createTable("collection_reminders", {
    reminder_id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    borrower_id: {
      type: "integer",
      notNull: true,
      references: "borrowers",
      onDelete: "CASCADE",
    },
    amount_expected: { type: "numeric(12,2)", default: 0 },
    due_date: { type: "date", notNull: true },
    note: { type: "text" },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "PENDING",
    },
    created_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
    updated_at: { type: "timestamp", default: pgm.func("CURRENT_TIMESTAMP") },
  });

  pgm.addConstraint(
    "collection_reminders",
    "collection_reminders_status_check",
    {
      check: "status IN ('PENDING', 'DONE', 'CANCELLED')",
    }
  );
}

export async function down(pgm) {
  // Drop in reverse order to respect foreign key dependencies
  pgm.dropTable("collection_reminders");
  pgm.dropTable("product_master");
  pgm.dropTable("borrower_notes");
  pgm.dropTable("payment_details");
  pgm.dropTable("loan_items");
  pgm.dropTable("transactions");
  pgm.dropTable("borrowers");
  pgm.dropTable("users");
  pgm.dropType("transaction_type");
  pgm.dropType("payment_method_type");
}
