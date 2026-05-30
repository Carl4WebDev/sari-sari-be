import dotenv from "dotenv";
dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "5000", 10),
  appUrl: process.env.APP_URL || "http://localhost:5000",
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT || "5432", 10),
  },
  semaphoreApiKey: process.env.SEMAPHORE_API_KEY,
  semaphoreSenderName: process.env.SEMAPHORE_SENDER_NAME || "Listahub",
};

if (!env.jwtSecret || env.jwtSecret.length < 32) {
  if (env.isProduction) {
    console.error("❌ FATAL: JWT_SECRET must be at least 32 characters in production");
    process.exit(1);
  } else {
    console.warn("⚠️ JWT_SECRET missing or too short. Login security is disabled.");
    env.jwtSecret = env.jwtSecret || "dev-only-insecure-secret";
  }
}

if (env.isProduction && !env.databaseUrl) {
  console.error("❌ FATAL: DATABASE_URL is required in production");
  process.exit(1);
}

if (!env.isProduction) {
  if (!env.db.user || !env.db.host || !env.db.name) {
    console.error("❌ FATAL: Missing database environment variables");
    process.exit(1);
  }
}

export { env };
