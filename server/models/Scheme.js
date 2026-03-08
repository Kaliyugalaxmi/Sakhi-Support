const mongoose = require("mongoose");

// Schema for eligibility questions
const eligibilityQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["yes_no", "number", "select", "text", "age_range", "income_range"],
  },
  options: {
    type: [String], // For select type questions
    default: undefined,
  },
  required: {
    type: Boolean,
    default: true,
  },
  // Defines what makes someone eligible for this question
  eligibilityCriteria: {
    // For yes_no: "yes" or "no"
    // For number/age/income: { min: X, max: Y }
    // For select: ["option1", "option2"]
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  helpText: {
    type: String, // Additional guidance for the question
  },
  weight: {
    type: Number,
    default: 1, // Importance of this question (1-5)
  },
});

const schemeSchema = new mongoose.Schema({
  schemeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Health", "Education", "Finance", "Housing", "Skill Development", "Safety", "Legal"],
  },
  lifeStage: {
    type: [String],
    required: true,
    enum: ["all", "unmarried", "pregnant", "mother", "married", "widow", "senior", "single", "young"],
  },
  state: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "🏛️",
  },
  benefit: {
    type: String,
    required: true,
  },
  // Keep the old eligibility for display purposes
  eligibility: {
    type: [String],
    required: true,
  },
  // NEW: Structured eligibility questions for the checker
  eligibilityQuestions: {
    type: [eligibilityQuestionSchema],
    default: [],
  },
  documents: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  howToApply: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  // Minimum eligibility score required (percentage)
  minimumEligibilityScore: {
    type: Number,
    default: 70, // 70% of questions must be satisfied
  },
}, {
  timestamps: true,
});

// Index for better search performance
schemeSchema.index({ name: "text", description: "text" });
schemeSchema.index({ category: 1 });
schemeSchema.index({ lifeStage: 1 });
schemeSchema.index({ state: 1 });

module.exports = mongoose.model("Scheme", schemeSchema);