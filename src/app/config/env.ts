import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().min(1)
});

const env = envSchema.parse(process.env);

const config = {
  port: env.PORT,
  node_env: env.NODE_ENV,
  database_url: env.DATABASE_URL
};

export default config;
