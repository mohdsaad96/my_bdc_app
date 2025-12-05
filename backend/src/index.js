import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

console.log("Environment loaded. Checking vars:");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("NODE_ENV:", process.env.NODE_ENV);
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    // Allow any origin in development (Vite may pick a different port like 5173 or 5174).
    // In production, set FRONTEND_URL env var to your front-end origin.
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "" : true,
    credentials: true,
  })
);

// Import routes dynamically to avoid circular import issues
const routesModule = await import('./routes/index.js');
app.use('/api', routesModule.default);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

