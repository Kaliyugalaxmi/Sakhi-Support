require("dotenv").config();

const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");
const schemesData = require("./schemes_dataset.json");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/sakhi-support";

const importSchemes = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected");

    await Scheme.deleteMany({});
    console.log("🗑️  Cleared existing schemes");

    const schemes = await Scheme.insertMany(schemesData);
    console.log(`✅ Successfully imported ${schemes.length} schemes`);

    const counts = await Scheme.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
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