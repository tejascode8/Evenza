const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Set custom DNS servers to resolve MongoDB Atlas mongodb+srv connection issues in development
if (process.env.NODE_ENV !== "production") {
  const dns = require("dns");
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

dotenv.config();

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const realtimeRoutes = require("./routes/realtime");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/realtime", realtimeRoutes);

const path = require("path");

// Serve frontend static assets from the build directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Fallback route: serve index.html for React Router client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/evenza")
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

