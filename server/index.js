const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ✅ INITIALIZE EXPRESS APP
const app = express();

// ✅ MIDDLEWARE
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES - Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MONGODB CONNECTION (DO THIS FIRST - BEFORE IMPORTING MODELS)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sakhi-support";

console.log("\n" + "=".repeat(70));
console.log("🚀 SAKHI SUPPORT SERVER INITIALIZATION");
console.log("=".repeat(70));
console.log(`📍 MongoDB URI: ${MONGODB_URI}`);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ✅ HEALTH CHECK ENDPOINT (before routes)
app.get("/api/health", (req, res) => {
  res.json({
    status: "✓ Server is running",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "✓ Connected" : "✗ Disconnected"
  });
});

// ✅ IMPORT AND REGISTER ROUTES (MODELS ARE IMPORTED INSIDE ROUTES)
console.log("\n📌 Registering Routes...");

// Auth Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
console.log("   ✓ /api/auth");

// Community Routes
const communityRoutes = require("./routes/community");
app.use("/api/community", communityRoutes);
console.log("   ✓ /api/community");

// Schemes Routes
const schemesRoutes = require("./routes/schemes");
app.use("/api/schemes", schemesRoutes);
console.log("   ✓ /api/schemes");

// Jobs Routes (NEW - ADMIN PANEL)
const jobsRoutes = require("./routes/jobs");
app.use("/api/jobs", jobsRoutes);
console.log("   ✓ /api/jobs");

console.log("\n✅ All routes registered successfully");

// ✅ 404 HANDLER - Must be AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// ✅ ERROR HANDLING MIDDLEWARE - Must be LAST
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("✅ SERVER STARTED SUCCESSFULLY");
  console.log("=".repeat(70));
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n📚 Available Routes:`);
  console.log(`   Auth:      http://localhost:${PORT}/api/auth`);
  console.log(`   Community: http://localhost:${PORT}/api/community`);
  console.log(`   Schemes:   http://localhost:${PORT}/api/schemes`);
  console.log(`   Jobs:      http://localhost:${PORT}/api/jobs (ADMIN)`);
  console.log("=".repeat(70) + "\n");
});

// ✅ GRACEFUL SHUTDOWN
process.on("SIGTERM", () => {
  console.log("⏹️  Server shutting down gracefully...");
  mongoose.connection.close();
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = app;