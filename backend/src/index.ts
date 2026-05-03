import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { getEnv } from "./config/env.js";
import { Logger } from "./utils/logger.js";

const env = getEnv();
const frontendClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (frontendClientId && frontendClientId !== env.GOOGLE_CLIENT_ID) {
  Logger.warn(
    "Google OAuth client IDs differ between frontend and backend environment values.",
    {
      backendGoogleClientId: env.GOOGLE_CLIENT_ID,
      frontendGoogleClientId: frontendClientId,
    }
  );
}

connectDb()
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(env.PORT, () => {
      console.log(`✓ AdMiro API running on http://localhost:${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("✗ Failed to connect to MongoDB:", error);
    process.exit(1);
  });
