import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "path";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from the dist/spa directory
  app.use(express.static(path.join(__dirname, "../dist/spa")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // SPA fallback: serve index.html for all non-API routes
  // This allows React Router to handle client-side routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../dist/spa/index.html"));
  });

  return app;
}
