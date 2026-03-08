const express = require("express");
const router = express.Router();
const Scheme = require("../models/Scheme");

// ─────────────────────────────────────────────────────────────
// IMPORTANT: /stats/counts MUST be before /:id
// Otherwise Express matches "stats" as an :id param and the
// endpoint never executes — which caused 0 results on the page.
// ─────────────────────────────────────────────────────────────

// GET ALL SCHEMES
router.get("/", async (req, res) => {
  try {
    const { category, search, lifeStage, state } = req.query;
    const filter = {};

    if (category && category !== "All Categories") filter.category = category;
    if (lifeStage && lifeStage !== "all") filter.lifeStage = { $in: [lifeStage] };
    if (state) filter.state = state;
    if (search) filter.$text = { $search: search };

    // Do NOT exclude eligibilityQuestions — the card needs it to show "Check Eligibility"
    const schemes = await Scheme.find(filter).limit(50);

    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET STATS — must be BEFORE /:id
router.get("/stats/counts", async (req, res) => {
  try {
    const total = await Scheme.countDocuments({});
    const byCategory = await Scheme.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const categoryObject = {};
    byCategory.forEach((item) => { categoryObject[item._id] = item.count; });
    res.json({ success: true, data: { total, byCategory: categoryObject } });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET SINGLE SCHEME — after /stats/counts
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, error: "Scheme not found" });
    res.json({ success: true, data: scheme });
  } catch (error) {
    console.error("Error fetching scheme:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CHECK ELIGIBILITY
router.post("/:id/check-eligibility", async (req, res) => {
  try {
    const { answers } = req.body;
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, error: "Scheme not found" });
    if (!scheme.eligibilityQuestions?.length)
      return res.status(400).json({ success: false, error: "No eligibility questions for this scheme" });

    let totalWeight = 0, satisfiedWeight = 0;
    const satisfiedCriteria = [], missingCriteria = [];

    scheme.eligibilityQuestions.forEach((q) => {
      const ans = answers[q.id];
      const w = q.weight || 1;
      totalWeight += w;
      let ok = false;

      if (q.type === "yes_no") {
        ok = ans === q.eligibilityCriteria;
      } else if (["number", "age_range", "income_range"].includes(q.type)) {
        const n = parseInt(ans);
        const { min, max } = q.eligibilityCriteria;
        if (min != null && max != null) ok = n >= min && n <= max;
        else if (min != null) ok = n >= min;
        else if (max != null) ok = n <= max;
      } else if (q.type === "select") {
        ok = q.eligibilityCriteria.includes(ans);
      } else if (q.type === "text") {
        ok = ans && ans.trim().length > 0;
      }

      if (ok) {
        satisfiedWeight += w;
        satisfiedCriteria.push({ question: q.question, answer: ans, type: q.type });
      } else {
        missingCriteria.push({ question: q.question, helpText: q.helpText });
      }
    });

    const score = Math.round((satisfiedWeight / totalWeight) * 100);
    const threshold = scheme.minimumEligibilityScore || 70;
    const eligible = score >= threshold;

    res.json({
      success: true, eligible, score, threshold,
      message: eligible
        ? `You meet the eligibility criteria for ${scheme.name}. Gather the required documents before applying.`
        : `You do not fully meet the criteria — ${missingCriteria.length} requirement(s) not satisfied.`,
      satisfiedCriteria, missingCriteria,
      schemeName: scheme.name, schemeId: scheme._id,
    });
  } catch (error) {
    console.error("Error checking eligibility:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE (ADMIN)
router.post("/", async (req, res) => {
  try {
    const saved = await new Scheme(req.body).save();
    res.status(201).json({ success: true, message: "Scheme created successfully", data: saved });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE (ADMIN)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: "Scheme not found" });
    res.json({ success: true, message: "Scheme updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE (ADMIN)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Scheme.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Scheme not found" });
    res.json({ success: true, message: "Scheme deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;