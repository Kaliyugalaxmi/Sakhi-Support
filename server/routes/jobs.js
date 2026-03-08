const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// ═══════════════════════════════════════════════════════════
// GET ALL JOBS (with filters)
// ═══════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    const { type, search, status } = req.query;
    
    let filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    } else {
      // Default to active jobs only
      filter.status = "active";
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════
// GET SINGLE JOB BY ID
// ═══════════════════════════════════════════════════════════
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════
// CREATE JOB (ADMIN)
// ═══════════════════════════════════════════════════════════
router.post("/", async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const saved = await newJob.save();
    
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════
// UPDATE JOB (ADMIN)
// ═══════════════════════════════════════════════════════════
router.put("/:id", async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }
    
    res.json({
      success: true,
      message: "Job updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE JOB (ADMIN)
// ═══════════════════════════════════════════════════════════
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }
    
    res.json({
      success: true,
      message: "Job deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;