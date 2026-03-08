const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Job title is required"],
    trim: true,
  },
  company: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "Work from Home",
      "Part-time · Local",
      "Freelance",
      "Full-time · Office",
      "Contract",
    ],
    default: "Work from Home",
  },
  pay: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "💼",
  },
  description: {
    type: String,
    required: [true, "Job description is required"],
  },
  location: {
    type: String,
    default: "Remote",
  },
  duration: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Flexible", "Temporary"],
    default: "Full-time",
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["active", "inactive", "closed"],
    default: "active",
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  applicationDeadline: {
    type: Date,
  },
  requirements: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// Index for better search performance
jobSchema.index({ title: "text", description: "text", company: "text" });
jobSchema.index({ type: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ postedDate: -1 });

module.exports = mongoose.model("Job", jobSchema);