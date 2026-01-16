// this import i can use because i wrote type of module instead of const express = require("express").
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
// Routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import paymentRoutes from "./routes/payment.route.js";

dotenv.config();
const app = express();

//i use PORT all capital indicating its const
const PORT = process.env.PORT || 5001;

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//limit the size of the payload to parse
app.use(express.json({ limit: "10mb" }));

app.use(cookieParser());

// API middleware
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);

// Production SPA
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../Frontend/dist");
  app.use(express.static(frontendDistPath));

  // Catch-all for SPA routing
  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
connectDB();
// Start server
