/**
 * Fix Schema Issues Migration
 *
 * Fixes:
 * 1. Duplicate enum values in payment_method_type (remove "CREDIT CARD" / "DEBIT CARD")
 * 2. Invalid data (year 20002 DOB, empty product names, zero-quantity items)
 * 3. Add product_id FK to loan_items
 * 4. Fix localhost URLs in profile_image_url (store relative paths)
 * 5. Add updated_at to borrower_notes
 */

export async function up(pgm) {
  // ── 1. Fix duplicate enum values ──────────────────────────────────────────
  // Migrate existing rows from spaced variants to underscored variants
  pgm.sql(`
    UPDATE payment_details
    SET payment_method = 'CREDIT_CARD'
    WHERE payment_method::text = 'CREDIT CARD'
  `);

  pgm.sql(`
    UPDATE payment_details
    SET payment_method = 'DEBIT_CARD'
    WHERE payment_method::text = 'DEBIT CARD'
  `);

  // Recreate enum without the spaced variants
  pgm.sql(`ALTER TYPE payment_method_type RENAME TO payment_method_type_old`);

  pgm.sql(`
    CREATE TYPE payment_method_type AS ENUM (
      'CASH', 'GCASH', 'CREDIT_CARD', 'DEBIT_CARD'
    )
  `);

  pgm.sql(`
    ALTER TABLE payment_details
    ALTER COLUMN payment_method
    TYPE payment_method_type
    USING payment_method::text::payment_method_type
  `);

  pgm.sql(`DROP TYPE payment_method_type_old`);

  // ── 2. Fix invalid data ──────────────────────────────────────────────────
  // Fix year 20002 DOB on borrower 17
  pgm.sql(`
    UPDATE borrowers
    SET dob = '2000-02-02'
    WHERE dob = '20002-02-02'
  `);

  // Fix empty product name on loan_item 21
  pgm.sql(`
    UPDATE loan_items
    SET product_name = 'Unknown'
    WHERE product_name = ''
  `);

  // Delete zero-quantity loan items (loan_item 26)
  pgm.sql(`
    DELETE FROM loan_items
    WHERE quantity = 0
  `);

  // ── 3. Add product_id FK to loan_items ───────────────────────────────────
  pgm.addColumn("loan_items", {
    product_id: {
      type: "integer",
      references: "product_master",
      onDelete: "SET NULL",
    },
  });

  pgm.addIndex("loan_items", ["product_id"], {
    name: "idx_loan_items_product_id",
  });

  // ── 4. Fix localhost URLs in profile_image_url ───────────────────────────
  pgm.sql(`
    UPDATE borrowers
    SET profile_image_url = REPLACE(
      profile_image_url,
      'http://localhost:5000',
      ''
    )
    WHERE profile_image_url LIKE 'http://localhost:5000%'
  `);

  // ── 5. Add updated_at to borrower_notes ──────────────────────────────────
  pgm.addColumn("borrower_notes", {
    updated_at: {
      type: "timestamp",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(pgm) {
  // ── 5. Remove updated_at from borrower_notes ─────────────────────────────
  pgm.dropColumn("borrower_notes", "updated_at");

  // ── 4. No reverse for URL fix (relative paths are correct) ──────────────

  // ── 3. Remove product_id from loan_items ─────────────────────────────────
  pgm.dropIndex("loan_items", ["product_id"], { name: "idx_loan_items_product_id" });
  pgm.dropColumn("loan_items", "product_id");

  // ── 2. No reverse for data fixes (invalid data should stay fixed) ───────

  // ── 1. Restore duplicate enum values ─────────────────────────────────────
  pgm.sql(`ALTER TYPE payment_method_type RENAME TO payment_method_type_old`);

  pgm.sql(`
    CREATE TYPE payment_method_type AS ENUM (
      'CASH', 'GCASH', 'CREDIT_CARD', 'DEBIT_CARD', 'CREDIT CARD', 'DEBIT CARD'
    )
  `);

  pgm.sql(`
    ALTER TABLE payment_details
    ALTER COLUMN payment_method
    TYPE payment_method_type
    USING payment_method::text::payment_method_type
  `);

  pgm.sql(`DROP TYPE payment_method_type_old`);
}
