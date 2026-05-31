export async function up(pgm) {
  pgm.addColumn("borrowers", {
    email: { type: "varchar(255)", notNull: false },
  });
}

export async function down(pgm) {
  pgm.dropColumn("borrowers", "email");
}
