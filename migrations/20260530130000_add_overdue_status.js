export async function up(pgm) {
  // Drop the existing CHECK constraint
  pgm.dropConstraint("collection_reminders", "collection_reminders_status_check");

  // Add new CHECK constraint with OVERDUE included
  pgm.addConstraint("collection_reminders", "collection_reminders_status_check", {
    check: "status IN ('PENDING', 'DONE', 'CANCELLED', 'OVERDUE')",
  });
};

export async function down(pgm) {
  pgm.dropConstraint("collection_reminders", "collection_reminders_status_check");

  pgm.addConstraint("collection_reminders", "collection_reminders_status_check", {
    check: "status IN ('PENDING', 'DONE', 'CANCELLED')",
  });
}
