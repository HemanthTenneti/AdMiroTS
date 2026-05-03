import { z } from "zod";
import { ValidationError } from "../utils/errors/ValidationError";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/admiro"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET environment variable is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID environment variable is required"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),

  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
  R2_UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().min(30).max(3600).default(600),
});

export type AppEnv = z.infer<typeof EnvSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const path = issue.path.join(".") || "env";
      acc[path] = issue.message;
      return acc;
    }, {});
    throw new ValidationError("Invalid environment configuration", details);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function isR2Configured(env: AppEnv): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME
  );
}

export function getCorsOrigins(env: AppEnv): string[] {
  return env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
