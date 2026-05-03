import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { getEnv } from "./config/env.js";

const env = getEnv();

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
