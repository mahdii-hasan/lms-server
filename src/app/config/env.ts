import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().min(1),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  EMAIL_USER: z.string().min(1),
  EMAIL_PASS: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  JWT_ACCESS_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),
  JWT_ABSOLUTE_SESSION_EXPIRES_IN: z.string().min(1),

  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),

  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(15),

  CLIENT_URL: z.string().url().min(1),
});

const env = envSchema.parse(process.env);

const config = {
  port: env.PORT,
  node_env: env.NODE_ENV,
  database_url: env.DATABASE_URL,
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,
  email_user: env.EMAIL_USER,
  email_pass: env.EMAIL_PASS,
  jwt_access_secret: env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: env.JWT_REFRESH_SECRET,

  jwt_access_expires_in: env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,
  jwt_absolute_session_expires_in: env.JWT_ABSOLUTE_SESSION_EXPIRES_IN,

  jwt_issuer: env.JWT_ISSUER,
  jwt_audience: env.JWT_AUDIENCE,

  password_reset_expires_minutes: env.PASSWORD_RESET_EXPIRES_MINUTES,
  client_url: env.CLIENT_URL,
};

export default config;
