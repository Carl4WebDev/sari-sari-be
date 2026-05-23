import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const required = isProduction
  ? ["JWT_SECRET", "DATABASE_URL"]
  : ["JWT_SECRET", "DB_USER", "DB_HOST", "DB_NAME", "DB_PORT"];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  appUrl: process.env.APP_URL || "http://localhost:5000",

  databaseUrl: process.env.DATABASE_URL,

  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    pass: process.env.DB_PASS,
    port: Number(process.env.DB_PORT) || 5432,
  },
};
