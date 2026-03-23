import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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
      "profile"
    ]
  });
});

export default app;
