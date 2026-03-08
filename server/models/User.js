const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════════════════════
// USER SCHEMA & MODEL
// ═══════════════════════════════════════════════════════════════════════════

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },

    // Contact & Location
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },

    // Profile Info (from later edits)
    age: String,
    maritalStatus: String,
    yearsWidowed: String,
    dependents: String,
    education: String,
    skills: String,
    employmentStatus: String,
    monthlyIncome: String,

    // Verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    terms: {
      type: Boolean,
      default: false,
    },

    // Admin & Status
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically update updatedAt
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════════════════

userSchema.index({ email: 1 }); // Fast email lookups
userSchema.index({ createdAt: -1 }); // Recent users first

// ═══════════════════════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════════════════════

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE & EXPORT MODEL
// ═══════════════════════════════════════════════════════════════════════════

module.exports = mongoose.model("User", userSchema);