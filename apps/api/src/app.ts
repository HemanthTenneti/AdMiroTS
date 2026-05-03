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
import { getCorsOrigins, getEnv } from "./config/env.js";

const app = express();

const env = getEnv();
const allowedOrigins = getCorsOrigins(env);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" }));
app.use(morgan("dev"));

app.use(responseFormatter);
app.use(generalRateLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "admiro-api" });
});

app.get("/api/workflow", (_req, res) => {
  res.json({
    workflow: [
      "auth",
      "advertisements",
      "displays",
      "display-loops",
      "analytics",
      "system-logs",
      "profile",
    ],
  });
});

app.use("/api/auth", authRateLimiter, createAuthRoutes(env.JWT_SECRET, env.GOOGLE_CLIENT_ID, env.JWT_EXPIRES_IN));
app.use("/api/profile", createProfileRoutes(env.JWT_SECRET));
app.use("/api/advertisements", createAdvertisementRoutes(env.JWT_SECRET));
app.use("/api/displays", createDisplayRoutes(env.JWT_SECRET));
app.use("/api/display-loops", createDisplayLoopRoutes(env.JWT_SECRET));
app.use("/api/analytics", createAnalyticsRoutes(env.JWT_SECRET));
app.use("/api/system-logs", createSystemLogRoutes(env.JWT_SECRET));

app.use(errorHandler);

export default app;
