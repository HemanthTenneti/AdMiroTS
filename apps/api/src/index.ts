import dotenv from "dotenv";
import app from "./app.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT ?? 8000);

// Connect to database before starting server
// This ensures all database models are ready before accepting requests
connectDb()
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`✓ AdMiro API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("✗ Failed to connect to MongoDB:", error);
    process.exit(1);
  });
