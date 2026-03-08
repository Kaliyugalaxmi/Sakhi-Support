const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Community = require("../models/Community");

// ✅ MULTER CONFIGURATION FOR IMAGE UPLOADS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Community.find()
      .sort({ createdAt: -1 }) // Most recent first
      .limit(100);
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
});

// ✅ CREATE NEW POST (with optional image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { content, category, author } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: "Content must be 500 characters or less" });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({ message: "Author is required" });
    }

    // Create post object
    const postData = {
      author: author.trim(),
      content: content.trim(),
      category: category || "General",
      likes: 0,
      likedBy: [],
      replies: []
    };

    // Add image path if file was uploaded
    if (req.file) {
      postData.image = "/uploads/" + req.file.filename;
    }

    const post = new Community(postData);
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    
    // Clean up uploaded file if post creation failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
});

// ✅ LIKE/UNLIKE POST
router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "like" or "unlike"
    const userName = req.body.userName || "Anonymous"; // Get from auth later

    const post = await Community.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (action === "like") {
      // Add like if not already liked
      if (!post.likedBy.includes(userName)) {
        post.likes = (post.likes || 0) + 1;
        post.likedBy.push(userName);
      }
    } else if (action === "unlike") {
      // Remove like if previously liked
      if (post.likedBy.includes(userName)) {
        post.likes = Math.max(0, (post.likes || 0) - 1);
        post.likedBy = post.likedBy.filter(name => name !== userName);
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to update like", error: error.message });
  }
});

// ✅ DELETE POST (optional - for later)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Community.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete associated image if exists
    if (post.image) {
      const imagePath = path.join(__dirname, "..", post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Community.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
});

// ✅ ADD REPLY TO POST (optional - for later)
router.post("/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const post = await Community.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.replies.push({
      author: author || "Anonymous",
      content: content.trim(),
      createdAt: new Date()
    });

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ message: "Failed to add reply", error: error.message });
  }
});

module.exports = router;