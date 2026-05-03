import fs from "node:fs";
import path from "node:path";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

const rootDir = process.cwd();
const backendEnvPath = path.join(rootDir, "backend", ".env");
const frontendEnvPath = path.join(rootDir, "frontend", ".env.local");

const backendEnv = parseEnvFile(backendEnvPath);
const frontendEnv = parseEnvFile(frontendEnvPath);

const backendGoogle = backendEnv.GOOGLE_CLIENT_ID;
const frontendGoogle = frontendEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (backendGoogle && frontendGoogle && backendGoogle !== frontendGoogle) {
  console.warn("[WARN] Google OAuth client IDs are misaligned:");
  console.warn(`       backend/.env GOOGLE_CLIENT_ID=${backendGoogle}`);
  console.warn(`       frontend/.env.local NEXT_PUBLIC_GOOGLE_CLIENT_ID=${frontendGoogle}`);
  console.warn("       Google login may fail due to audience mismatch.");
}

const apiBase = frontendEnv.NEXT_PUBLIC_API_BASE_URL;
if (apiBase && !/^https?:\/\//.test(apiBase)) {
  console.warn(
    `[WARN] frontend/.env.local NEXT_PUBLIC_API_BASE_URL does not look like a valid URL: ${apiBase}`
  );
}

const corsOrigins = backendEnv.CORS_ORIGINS;
if (corsOrigins) {
  const requiredOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const missing = requiredOrigins.filter((origin) => !corsOrigins.split(",").map((value) => value.trim()).includes(origin));
  if (missing.length > 0) {
    console.warn(
      `[WARN] backend/.env CORS_ORIGINS is missing recommended local origins: ${missing.join(", ")}`
    );
  }
}
