require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// ✅ INITIALIZE EXPRESS APP
const app = express();

// ✅ CORS
// Render mein CLIENT_URL set karo (jaise https://sakhi-support-xyz.vercel.app)
// Ek se zyada URL ho to comma se alag karo: url1,url2
const staticOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://sakhi-support-app.vercel.app",
];

const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, "")) // last "/" hata do
  .filter(Boolean);

const allowedOrigins = [...staticOrigins, ...envOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    // Postman / server-to-server requests mein origin nahi hota
    if (!origin) return callback(null, true);

    let hostname = "";
    try {
      hostname = new URL(origin).hostname;
    } catch {
      return callback(null, false);
    }

    // Is project ke Vercel preview/production URLs bhi allow
    const isSakhiVercel =
      hostname.endsWith(".vercel.app") && hostname.includes("sakhi-support");

    if (allowedOrigins.includes(origin) || isSakhiVercel) {
      return callback(null, true);
    }

    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight requests ke liye

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES - Serve uploads folder
// Note: Render free plan par restart ke baad uploads delete ho jati hain
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MONGODB URI (.env mein MONGODB_URI ya MONGO_URI, dono chalenge)
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/sakhi-support";

// Password hide karke print karne ke liye
const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

console.log("\n" + "=".repeat(70));
console.log("🚀 SAKHI SUPPORT SERVER INITIALIZATION");
console.log("=".repeat(70));
console.log(`📍 MongoDB URI: ${maskedUri}`);
console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET set nahi hai!");
}

// ✅ ROOT + HEALTH CHECK (routes se pehle)
app.get("/", (req, res) => {
  res.json({ message: "Sakhi Support API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "✓ Server is running",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "✓ Connected" : "✗ Disconnected",
  });
});

// ✅ IMPORT AND REGISTER ROUTES
console.log("\n📌 Registering Routes...");

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
console.log("   ✓ /api/auth");

const communityRoutes = require("./routes/community");
app.use("/api/community", communityRoutes);
console.log("   ✓ /api/community");

const schemesRoutes = require("./routes/schemes");
app.use("/api/schemes", schemesRoutes);
console.log("   ✓ /api/schemes");

const jobsRoutes = require("./routes/jobs");
app.use("/api/jobs", jobsRoutes);
console.log("   ✓ /api/jobs");

console.log("\n✅ All routes registered successfully");

// ✅ 404 HANDLER - Must be AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// ✅ ERROR HANDLING MIDDLEWARE - Must be LAST
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ CONNECT TO MONGODB, THEN START SERVER
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("\n✅ MongoDB Connected successfully");

    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(70));
      console.log("✅ SERVER STARTED SUCCESSFULLY");
      console.log("=".repeat(70));
      console.log(`🚀 Server running on port: ${PORT}`);
      console.log(`🏥 Health Check: /api/health`);
      console.log(`\n📚 Available Routes:`);
      console.log(`   Auth:      /api/auth`);
      console.log(`   Community: /api/community`);
      console.log(`   Schemes:   /api/schemes`);
      console.log(`   Jobs:      /api/jobs (ADMIN)`);
      console.log("=".repeat(70) + "\n");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ✅ GRACEFUL SHUTDOWN
process.on("SIGTERM", async () => {
  console.log("⏹️  Server shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// Ek galat request poore server ko band na kare, isliye sirf log karo
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

module.exports = app;