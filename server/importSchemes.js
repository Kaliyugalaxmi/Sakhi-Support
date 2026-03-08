const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");
const schemesData = require("./schemes_dataset.json");
require("dotenv").config();

const importSchemes = async () => {
  try {
    // Connect to MongoDB
await mongoose.connect("mongodb://127.0.0.1:27017/sakhi-support");    console.log("✅ MongoDB Connected");

    // Clear existing schemes (optional - remove if you want to keep existing data)
    await Scheme.deleteMany({});
    console.log("🗑️  Cleared existing schemes");

    // Insert new schemes
    const schemes = await Scheme.insertMany(schemesData);
    console.log(`✅ Successfully imported ${schemes.length} schemes`);

    // Show summary
    const counts = await Scheme.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Schemes by Category:");
    counts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });

    console.log("\n✨ Import completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing schemes:", error);
    process.exit(1);
  }
};

importSchemes();