const mongoose = require("mongoose");
const Job = require("./models/Job");
const jobsData = require("./jobs_dataset.json");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sakhi-support";

const importJobs = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing jobs
    await Job.deleteMany({});
    console.log("🗑️  Cleared existing jobs");

    // Insert new jobs
    const jobs = await Job.insertMany(jobsData);
    console.log(`✅ Successfully imported ${jobs.length} jobs`);

    // Show summary
    const counts = await Job.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Jobs by Type:");
    counts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });

    // Show duration breakdown
    const durationCounts = await Job.aggregate([
      { $group: { _id: "$duration", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("\n⏱️  Jobs by Duration:");
    durationCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });

    console.log("\n✨ Jobs import completed successfully!");
    console.log("\n💡 You can now:");
    console.log("   1. Visit http://localhost:5173/dashboard and go to Jobs");
    console.log("   2. Browse available job opportunities");
    console.log("   3. Use the admin panel to add/edit jobs");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing jobs:", error);
    process.exit(1);
  }
};

importJobs();