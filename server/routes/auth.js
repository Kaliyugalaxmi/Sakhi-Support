const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ IMPORT USER MODEL
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// ═══════════════════════════════════════════════════════════════════════════
// ✅ REGISTER ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════
router.post("/register", async (req, res) => {
  try {
    console.log("📤 Registration request received:", req.body);

    const { name, email, password, phone, state, city, terms } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !state || !city) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, password, phone, state, city)",
      });
    }

    // Validate terms acceptance
    if (!terms) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please log in or use another email.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      state,
      city,
      terms: true,
    });

    // Save to database
    await newUser.save();
    console.log("✅ User saved to database:", newUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ JWT token generated");

    // Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      name: newUser.name,
      email: newUser.email,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        state: newUser.state,
        city: newUser.city,
      },
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ LOGIN ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════
router.post("/login", async (req, res) => {
  try {
    console.log("📤 Login request received");

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ Login successful for user:", email);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful!",
      name: user.name,
      email: user.email,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        city: user.city,
      },
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ GET CURRENT USER (Protected Route)
// ═══════════════════════════════════════════════════════════════════════════
router.get("/me", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.email);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      message: "User data retrieved",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        city: user.city,
      },
    });

  } catch (error) {
    console.error("❌ Auth error:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ LOGOUT ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════
router.post("/logout", (req, res) => {
  try {
    // In a real app, you'd invalidate the token in Redis/blacklist
    // For now, just return success (client clears localStorage)
    console.log("✅ User logged out");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ VERIFY EMAIL (OTP)
// ═══════════════════════════════════════════════════════════════════════════
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // TODO: In production, verify OTP from cache/database
    // For now, accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format",
      });
    }

    // TODO: Check if OTP matches what was sent
    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════════════
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: "If email exists, password reset link has been sent",
      });
    }

    // TODO: Generate reset token
    // TODO: Send email with reset link
    console.log("📧 Password reset link would be sent to:", email);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ RESET PASSWORD
// ═══════════════════════════════════════════════════════════════════════════
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // TODO: Verify reset token
    // TODO: Update password in database

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✅ UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════════════════
router.put("/profile", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Update user data
    const { name, email, phone, state, city } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email: email ? email.toLowerCase() : undefined, phone, state, city },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ Profile updated for user:", decoded.email);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        state: updatedUser.state,
        city: updatedUser.city,
      },
    });

  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
});

module.exports = router;