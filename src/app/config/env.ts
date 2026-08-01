import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().min(1),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
});

const env = envSchema.parse(process.env);

const config = {
  port: env.PORT,
  node_env: env.NODE_ENV,
  database_url: env.DATABASE_URL,
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,
};

export default config;
