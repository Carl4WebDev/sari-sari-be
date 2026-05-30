export async function up(pgm) {
  // Create sms_logs table for audit trail
  pgm.createTable("sms_logs", {
    sms_id: { type: "serial", primaryKey: true },
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
    reminder_id: {
      type: "integer",
      references: "collection_reminders",
      onDelete: "SET NULL",
    },
    recipient_number: { type: "varchar(20)", notNull: true },
    message: { type: "text", notNull: true },
    status: { type: "varchar(20)" },
    semaphore_message_id: { type: "integer" },
    created_at: {
      type: "timestamp",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // Index for rate limit queries
  pgm.createIndex("sms_logs", ["user_id", "created_at"], {
    name: "idx_sms_logs_user_created",
  });

  // Add send_sms flag to collection_reminders
  pgm.addColumn("collection_reminders", {
    send_sms: { type: "boolean", default: false },
  });
}

export async function down(pgm) {
  pgm.dropColumn("collection_reminders", "send_sms");
  pgm.dropTable("sms_logs");
}
