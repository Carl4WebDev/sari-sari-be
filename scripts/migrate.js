import 'dotenv/config';
import pg from 'pg';
import { spawnSync } from 'node:child_process';

// Map app .env vars to PG* env vars
const env = { ...process.env };
for (const [pgVar, appVar] of Object.entries({
  PGHOST: 'DB_HOST',
  PGPORT: 'DB_PORT',
  PGUSER: 'DB_USER',
  PGPASSWORD: 'DB_PASS',
  PGDATABASE: 'DB_NAME',
})) {
  if (!env[pgVar] && env[appVar]) env[pgVar] = env[appVar];
}

// Seed pgmigrations for untracked migrations that already applied
const UNTRACKED_MIGRATIONS = [
  { name: '20260531120000_add_sms_tables', check: { table: 'sms_logs' } },
  { name: '20260601120000_add_borrower_email', check: { table: 'borrowers', column: 'email' } },
  { name: '20260602120000_add_expenses_table', check: { table: 'expenses' } },
  { name: '20260603120000_add_subscriptions_table', check: { table: 'subscriptions' } },
  { name: '20260907120000_admin_subscriptions', check: { table: 'user_subscription' } },
];

async function syncMigrations() {
  const client = new pg.Client();
  await client.connect();

  try {
    // Check if pgmigrations table exists
    const { rows: tbl } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'pgmigrations'`
    );
    if (tbl.length === 0) return; // Fresh DB, let node-pg-migrate handle everything

    // Get already-tracked migration names
    const { rows: tracked } = await client.query('SELECT name FROM pgmigrations');
    const trackedNames = new Set(tracked.map((r) => r.name));

    // Find untracked migrations whose tables/columns already exist
    const toSeed = [];
    for (const m of UNTRACKED_MIGRATIONS) {
      if (trackedNames.has(m.name)) continue;

      if (m.check.column) {
        const { rows } = await client.query(
          `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
          [m.check.table, m.check.column]
        );
        if (rows.length > 0) toSeed.push(m.name);
      } else {
        const { rows } = await client.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
          [m.check.table]
        );
        if (rows.length > 0) toSeed.push(m.name);
      }
    }

    if (toSeed.length > 0) {
      for (const name of toSeed) {
        await client.query(
          `INSERT INTO pgmigrations (name, run_on) VALUES ($1, NOW()) ON CONFLICT DO NOTHING`,
          [name]
        );
      }
      console.log(`Seeded ${toSeed.length} untracked migration(s): ${toSeed.join(', ')}`);
    }
  } finally {
    await client.end();
  }
}

// Sync, then run node-pg-migrate
try {
  await syncMigrations();
} catch (err) {
  console.error('Migration sync failed:', err.message);
}

const result = spawnSync(
  process.execPath,
  ['node_modules/node-pg-migrate/bin/node-pg-migrate.js', ...process.argv.slice(2)],
  { env, stdio: 'inherit' }
);
process.exitCode = result.status ?? 1;
