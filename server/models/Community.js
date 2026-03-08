const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ["General", "Jobs", "Schemes", "Legal", "Health", "Support"],
    default: "General"
  },
  image: {
    type: String,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String
  }],
  replies: [{
    author: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

communitySchema.index({ createdAt: -1 });
communitySchema.index({ category: 1 });

module.exports = mongoose.model("Community", communitySchema);