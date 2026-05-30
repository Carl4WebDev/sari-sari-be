export async function up(pgm) {
  pgm.createTable("push_subscriptions", {
    subscription_id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    endpoint: { type: "text", notNull: true },
    p256dh: { type: "text", notNull: true },
    auth: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.addConstraint("push_subscriptions", "push_subscriptions_user_endpoint_unique", {
    unique: ["user_id", "endpoint"],
  });
};

export async function down(pgm) {
  pgm.dropTable("push_subscriptions");
}
