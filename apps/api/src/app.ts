import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createAuthRoutes } from "./modules/auth/auth.routes.js";
import { createProfileRoutes } from "./modules/profile/profile.routes.js";
import { createAdvertisementRoutes } from "./modules/advertisements/advertisements.routes.js";
import { createDisplayRoutes } from "./modules/displays/displays.routes.js";
import { createDisplayLoopRoutes } from "./modules/display-loops/display-loops.routes.js";
import { createAnalyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { createSystemLogRoutes } from "./modules/system-logs/system-logs.routes.js";
import { authRateLimiter, generalRateLimiter } from "./middleware/rate-limit.middleware.js";
import { responseFormatter } from "./middleware/response-formatter.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

const app = express();

// Strict CORS configuration - whitelist allowed origins
// This prevents cross-site request forgery and protects against unauthorized access
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (like mobile apps or curl)
      // or from whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

// Security headers and parsing middleware
app.use(helmet());
// Strict payload limits to prevent large uploads and DoS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" }));
app.use(morgan("dev"));

// Apply response formatter to all routes
app.use(responseFormatter);

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

// Profile routes (protected - requires JWT)
app.use("/api/profile", createProfileRoutes(jwtSecret));

// Advertisement routes (mixed public/protected)
app.use("/api/advertisements", createAdvertisementRoutes(jwtSecret));

// Display routes (mixed public/protected)
app.use("/api/displays", createDisplayRoutes(jwtSecret));

// Display loop routes (mixed public/protected)
app.use("/api/display-loops", createDisplayLoopRoutes(jwtSecret));

// Analytics routes (mixed public/protected)
app.use("/api/analytics", createAnalyticsRoutes(jwtSecret));

// System log routes (protected)
app.use("/api/system-logs", createSystemLogRoutes(jwtSecret));

// Global error handler middleware (must be last)
app.use(errorHandler);

export default app;
