import dotenv from "dotenv";
dotenv.config();

const required = ["JWT_SECRET", "DB_USER", "DB_HOST", "DB_NAME"];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

export const env = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    pass: process.env.DB_PASS,
    port: process.env.DB_PORT,
  },
};
