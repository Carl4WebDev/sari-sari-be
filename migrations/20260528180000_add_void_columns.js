export async function up(pgm) {
  pgm.addColumn("transactions", {
    voided: { type: "boolean", default: false },
    voided_at: { type: "timestamp" },
    void_reason: { type: "text" },
  });
};

export async function down(pgm) {
  pgm.dropColumn("transactions", ["voided", "voided_at", "void_reason"]);
}
