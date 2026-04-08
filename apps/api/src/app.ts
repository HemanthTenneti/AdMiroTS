import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createAuthRoutes } from "./modules/auth/auth.routes.js";
import { authRateLimiter, generalRateLimiter } from "./middleware/rate-limit.middleware.js";

const app = express();

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// Health check endpoint (no rate limiting needed)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "admiro-api" });
});

// Workflow endpoint for API documentation
app.get("/api/workflow", (_req, res) => {
  res.json({
    workflow: [
      "auth",
      "advertisements",
      "displays",
      "display-loops",
      "analytics",
      "system-logs",
      "profile"
    ]
  });
});

// Authentication routes with strict rate limiting
// We apply authRateLimiter here to protect against brute-force attacks
// while the general limiter above prevents API abuse
const jwtSecret = process.env.JWT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID environment variable is required");
}

app.use("/api/auth", authRateLimiter, createAuthRoutes(jwtSecret, googleClientId, jwtExpiresIn));

export default app;
