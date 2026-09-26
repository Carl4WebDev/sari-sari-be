export async function up(pgm) {
  // Add last_seen to users for quick "who's online" checks
  pgm.addColumn('users', {
    last_seen: { type: 'timestamptz', default: null },
  });

  // Activity log for pilot monitoring — tracks key user actions
  pgm.createTable('activity_log', {
    log_id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    action: { type: 'varchar(50)', notNull: true },
    detail: { type: 'text', notNull: true, default: '' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('activity_log', ['user_id', 'created_at'], {
    name: 'idx_activity_log_user_time',
  });

  pgm.createIndex('activity_log', ['created_at'], {
    name: 'idx_activity_log_time',
  });
}

export async function down(pgm) {
  pgm.dropTable('activity_log');
  pgm.dropColumn('users', 'last_seen');
}
