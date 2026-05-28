export async function up(pgm) {
  // Index for borrower notes lookups by borrower_id
  pgm.addIndex("borrower_notes", ["borrower_id"], {
    name: "idx_borrower_notes_borrower",
  });
};

export async function down(pgm) {
  pgm.dropIndex("borrower_notes", ["borrower_id"], { name: "idx_borrower_notes_borrower" });
}
