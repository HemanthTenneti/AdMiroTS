import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDb } from "../src/config/db";

let dbReadyPromise: Promise<void> | null = null;

async function ensureDbReady(): Promise<void> {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDb();
  }
  await dbReadyPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await ensureDbReady();
  app(req, res);
}
