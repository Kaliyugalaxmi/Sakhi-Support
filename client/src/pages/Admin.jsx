import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("schemes");
  const [schemes, setSchemes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Form states
  const [schemeForm, setSchemeForm] = useState({
    schemeId: "",
    name: "",
    category: "Health",
    benefit: "",
    description: "",
    howToApply: "",
    state: "All India",
    website: "",
    status: "active",
    eligibility: "",
    documents: "",
    lifeStage: "all",
    icon: "🏛️",
    minimumEligibilityScore: 70,
  });

  const [eligibilityQuestions, setEligibilityQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: "",
    question: "",
    type: "yes_no",
    options: [],
    required: true,
    eligibilityCriteria: "",
    helpText: "",
    weight: 1,
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    type: "Work from Home",
    pay: "",
    icon: "💼",
    description: "",
    location: "",
    duration: "Full-time",
    tags: "",
  });

  // Fetch schemes
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/schemes`);
      const data = await res.json();
      setSchemes(data.data || []);
    } catch (err) {
      showMessage("Error fetching schemes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/jobs`);
      const data = await res.json();
      setJobs(data.data || []);
    } catch (err) {
      showMessage("Error fetching jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "schemes") fetchSchemes();
    else fetchJobs();
  }, [activeTab]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // ═══════════════════════════════════════════════════════════
  // SCHEME OPERATIONS
  // ═══════════════════════════════════════════════════════════

  const handleSchemeChange = (e) => {
    const { name, value } = e.target;
    setSchemeForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetSchemeForm = () => {
    setSchemeForm({
      schemeId: "",
      name: "",
      category: "Health",
      benefit: "",
      description: "",
      howToApply: "",
      state: "All India",
      website: "",
      status: "active",
      eligibility: "",
      documents: "",
      lifeStage: "all",
      icon: "🏛️",
      minimumEligibilityScore: 70,
    });
    setEligibilityQuestions([]);
    setEditingId(null);
  };

  const addOrUpdateScheme = async (e) => {
    e.preventDefault();

    if (!schemeForm.name || !schemeForm.benefit) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    try {
      const payload = {
        ...schemeForm,
        eligibility: schemeForm.eligibility
          .split("\n")
          .filter((e) => e.trim()),
        documents: schemeForm.documents.split(",").map((d) => d.trim()),
        lifeStage: [schemeForm.lifeStage],
        eligibilityQuestions: eligibilityQuestions,
        minimumEligibilityScore: parseInt(schemeForm.minimumEligibilityScore),
      };

      if (editingId) {
        const res = await fetch(`${API_BASE}/schemes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showMessage("Scheme updated successfully", "success");
          fetchSchemes();
          resetSchemeForm();
        } else {
          showMessage("Error updating scheme", "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/schemes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showMessage("Scheme added successfully", "success");
          fetchSchemes();
          resetSchemeForm();
        } else {
          showMessage("Error adding scheme", "error");
        }
      }
    } catch (err) {
      showMessage("Server error", "error");
    }
  };

  const editScheme = (scheme) => {
    setSchemeForm({
      schemeId: scheme.schemeId || "",
      name: scheme.name,
      category: scheme.category,
      benefit: scheme.benefit,
      description: scheme.description,
      howToApply: scheme.howToApply,
      state: scheme.state,
      website: scheme.website,
      status: scheme.status,
      eligibility: (scheme.eligibility || []).join("\n"),
      documents: (scheme.documents || []).join(", "),
      lifeStage: scheme.lifeStage?.[0] || "all",
      icon: scheme.icon || "🏛️",
      minimumEligibilityScore: scheme.minimumEligibilityScore || 70,
    });
    setEligibilityQuestions(scheme.eligibilityQuestions || []);
    setEditingId(scheme._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteScheme = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scheme?")) return;

    try {
      const res = await fetch(`${API_BASE}/schemes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showMessage("Scheme deleted successfully", "success");
        fetchSchemes();
      } else {
        showMessage("Error deleting scheme", "error");
      }
    } catch (err) {
      showMessage("Server error", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ELIGIBILITY QUESTIONS MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  const addEligibilityQuestion = () => {
    if (!currentQuestion.question.trim()) {
      showMessage("Please enter a question", "error");
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: currentQuestion.id || `q${eligibilityQuestions.length + 1}`,
      options: currentQuestion.type === "select" ? currentQuestion.options : undefined,
    };

    // Parse eligibility criteria based on type
    if (currentQuestion.type === "yes_no") {
      newQuestion.eligibilityCriteria = currentQuestion.eligibilityCriteria;
    } else if (["age_range", "income_range", "number"].includes(currentQuestion.type)) {
      try {
        newQuestion.eligibilityCriteria = JSON.parse(currentQuestion.eligibilityCriteria);
      } catch {
        showMessage("Please enter valid JSON for criteria (e.g., {\"min\": 18, \"max\": 60})", "error");
        return;
      }
    } else if (currentQuestion.type === "select") {
      try {
        newQuestion.eligibilityCriteria = JSON.parse(currentQuestion.eligibilityCriteria);
      } catch {
        showMessage("Please enter valid JSON array for criteria (e.g., [\"option1\", \"option2\"])", "error");
        return;
      }
    }

    setEligibilityQuestions([...eligibilityQuestions, newQuestion]);
    setCurrentQuestion({
      id: "",
      question: "",
      type: "yes_no",
      options: [],
      required: true,
      eligibilityCriteria: "",
      helpText: "",
      weight: 1,
    });
    setShowQuestionModal(false);
    showMessage("Question added", "success");
  };

  const removeEligibilityQuestion = (index) => {
    setEligibilityQuestions(eligibilityQuestions.filter((_, i) => i !== index));
    showMessage("Question removed", "success");
  };

  // ═══════════════════════════════════════════════════════════
  // JOB OPERATIONS (same as before)
  // ═══════════════════════════════════════════════════════════

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetJobForm = () => {
    setJobForm({
      title: "",
      company: "",
      type: "Work from Home",
      pay: "",
      icon: "💼",
      description: "",
      location: "",
      duration: "Full-time",
      tags: "",
    });
    setEditingId(null);
  };

  const addOrUpdateJob = async (e) => {
    e.preventDefault();

    if (!jobForm.title || !jobForm.company) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    try {
      const payload = {
        ...jobForm,
        tags: jobForm.tags.split(",").map((t) => t.trim()),
      };

      if (editingId) {
        const res = await fetch(`${API_BASE}/jobs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showMessage("Job updated successfully", "success");
          fetchJobs();
          resetJobForm();
        } else {
          showMessage("Error updating job", "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showMessage("Job added successfully", "success");
          fetchJobs();
          resetJobForm();
        } else {
          showMessage("Error adding job", "error");
        }
      }
    } catch (err) {
      showMessage("Server error", "error");
    }
  };

  const editJob = (job) => {
    setJobForm({
      title: job.title,
      company: job.company,
      type: job.type,
      pay: job.pay,
      icon: job.icon,
      description: job.description,
      location: job.location,
      duration: job.duration,
      tags: (job.tags || []).join(", "),
    });
    setEditingId(job._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showMessage("Job deleted successfully", "success");
        fetchJobs();
      } else {
        showMessage("Error deleting job", "error");
      }
    } catch (err) {
      showMessage("Server error", "error");
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: "#0d1c18",
        minHeight: "100vh",
        background: "#f4f8f6",
        padding: "2rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        :root {
          --teal: #1a6b5a; --teal-d: #134f42; --teal-m: #22896f;
          --teal-l: #c8e6dc; --teal-p: #ebf6f2;
          --sand: #e8a96a; --sand-l: #fdf3e7;
          --ink: #0d1c18; --ink-m: #344e44; --ink-s: #6b8c82;
          --border: #d0e6dc; --white: #ffffff; --bg: #f4f8f6; --bg2: #edf5f1;
        }
        .sf { font-family: 'Fraunces', serif; }

        .tab-button {
          background: var(--white); border: 1px solid var(--border);
          padding: 12px 24px; border-radius: 10px; cursor: pointer;
          font-size: 0.9rem; font-weight: 600; color: var(--ink-m);
          transition: all 0.2s ease; margin-right: 0.8rem;
        }
        .tab-button:hover { background: var(--teal-p); }
        .tab-button.active {
          background: var(--teal); color: white; border-color: var(--teal);
        }

        .form-group {
          margin-bottom: 1.2rem;
        }
        .form-label {
          display: block; font-weight: 600; font-size: 0.85rem;
          color: var(--ink); margin-bottom: 0.5rem; text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%; padding: 10px 14px; border: 1px solid var(--border);
          border-radius: 8px; font-size: 0.9rem; font-family: inherit;
          color: var(--ink); background: var(--white);
          transition: all 0.2s ease;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(26,107,90,0.1);
        }
        .form-textarea {
          resize: vertical; min-height: 100px;
        }

        .btn-primary {
          background: var(--teal); color: white; border: none;
          padding: 10px 24px; border-radius: 8px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;
        }
        .btn-primary:hover { background: var(--teal-d); transform: translateY(-1px); }
        .btn-primary:active { transform: scale(0.98); }

        .btn-secondary {
          background: transparent; color: var(--ink-m); border: 1px solid var(--border);
          padding: 10px 24px; border-radius: 8px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;
        }
        .btn-secondary:hover { background: var(--teal-p); border-color: var(--teal); }

        .btn-danger {
          background: #ffebee; color: #b84030; border: 1px solid #ffcdd2;
          padding: 6px 16px; border-radius: 6px; font-weight: 600;
          cursor: pointer; font-size: 0.8rem; transition: all 0.2s ease;
        }
        .btn-danger:hover { background: #ffcdd2; }

        .btn-edit {
          background: var(--sand-l); color: var(--sand); border: 1px solid #f5d9aa;
          padding: 6px 16px; border-radius: 6px; font-weight: 600;
          cursor: pointer; font-size: 0.8rem; transition: all 0.2s ease;
        }
        .btn-edit:hover { background: #f5d9aa; }

        .btn-small {
          padding: 6px 12px; font-size: 0.75rem;
        }

        .message {
          padding: 12px 16px; border-radius: 8px; margin-bottom: 1.5rem;
          font-size: 0.9rem; font-weight: 500; animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message.success {
          background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9;
        }
        .message.error {
          background: #ffebee; color: #b84030; border: 1px solid #ffcdd2;
        }

        .form-section {
          background: var(--white); border-radius: 14px; border: 1px solid var(--border);
          padding: 2rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(13,28,24,0.05);
        }

        .items-grid {
          display: grid; gap: 1rem;
        }

        .item-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 12px; padding: 1.2rem; transition: all 0.2s ease;
        }
        .item-card:hover { box-shadow: 0 6px 24px rgba(13,28,24,0.08); }

        .item-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 0.8rem;
        }

        .item-title {
          font-size: 1rem; font-weight: 700; color: var(--ink); margin-bottom: 0.3rem;
        }

        .item-meta {
          font-size: 0.8rem; color: var(--ink-s);
        }

        .item-actions {
          display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;
        }

        .two-column {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
        }

        .question-card {
          background: var(--bg2); border-radius: 10px; padding: 1rem;
          margin-bottom: 0.8rem; border: 1px solid var(--border);
        }

        .question-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 0.6rem;
        }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(13,28,24,0.6);
          backdrop-filter: blur(4px); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem;
        }

        .modal-content {
          background: var(--white); border-radius: 20px;
          max-width: 600px; width: 100%; max-height: 90vh;
          overflow-y: auto; box-shadow: 0 20px 60px rgba(13,28,24,0.3);
          padding: 2rem;
        }

        .close-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg2); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; color: var(--ink-m);
          transition: all 0.2s ease;
        }
        .close-btn:hover { background: var(--border); }

        @media (max-width: 1024px) {
          .two-column {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="sf" style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "var(--ink-s)", fontSize: "0.95rem" }}>
          Manage schemes and job opportunities
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          className={`tab-button ${activeTab === "schemes" ? "active" : ""}`}
          onClick={() => setActiveTab("schemes")}
        >
          🏛️ Schemes
        </button>
        <button
          className={`tab-button ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          💼 Jobs
        </button>
      </div>

      {/* Message */}
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      {/* ════════════════════════════════════════════════════════ */}
      {/* SCHEMES TAB */}
      {/* ════════════════════════════════════════════════════════ */}

      {activeTab === "schemes" && (
        <>
          {/* Form */}
          <div className="form-section">
            <h2 className="sf" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {editingId ? "Edit Scheme" : "Add New Scheme"}
            </h2>

            <form onSubmit={addOrUpdateScheme}>
              <div className="two-column">
                {/* Left Column */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Scheme ID</label>
                    <input
                      type="text"
                      name="schemeId"
                      className="form-input"
                      value={schemeForm.schemeId}
                      onChange={handleSchemeChange}
                      placeholder="e.g., PMMVY_001"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scheme Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={schemeForm.name}
                      onChange={handleSchemeChange}
                      placeholder="Scheme name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={schemeForm.category}
                      onChange={handleSchemeChange}
                    >
                      <option>Health</option>
                      <option>Education</option>
                      <option>Finance</option>
                      <option>Housing</option>
                      <option>Skill Development</option>
                      <option>Safety</option>
                      <option>Legal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Benefit *</label>
                    <input
                      type="text"
                      name="benefit"
                      className="form-input"
                      value={schemeForm.benefit}
                      onChange={handleSchemeChange}
                      placeholder="e.g., ₹5,000 in 3 installments"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={schemeForm.state}
                      onChange={handleSchemeChange}
                      placeholder="State or All India"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon Emoji</label>
                    <input
                      type="text"
                      name="icon"
                      className="form-input"
                      value={schemeForm.icon}
                      onChange={handleSchemeChange}
                      placeholder="🏛️"
                      maxLength="2"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Life Stage</label>
                    <select
                      name="lifeStage"
                      className="form-select"
                      value={schemeForm.lifeStage}
                      onChange={handleSchemeChange}
                    >
                      <option value="all">All</option>
                      <option value="unmarried">Unmarried/Young</option>
                      <option value="pregnant">Pregnant</option>
                      <option value="mother">Mother</option>
                      <option value="married">Married</option>
                      <option value="widow">Widow</option>
                      <option value="senior">Senior (60+)</option>
                      <option value="single">Single/Independent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      name="website"
                      className="form-input"
                      value={schemeForm.website}
                      onChange={handleSchemeChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={schemeForm.status}
                      onChange={handleSchemeChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Documents (comma-separated)</label>
                    <input
                      type="text"
                      name="documents"
                      className="form-input"
                      value={schemeForm.documents}
                      onChange={handleSchemeChange}
                      placeholder="Aadhaar, Bank Account, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Eligibility Score (%)</label>
                    <input
                      type="number"
                      name="minimumEligibilityScore"
                      className="form-input"
                      value={schemeForm.minimumEligibilityScore}
                      onChange={handleSchemeChange}
                      placeholder="70"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={schemeForm.description}
                  onChange={handleSchemeChange}
                  placeholder="Scheme description"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligibility (one per line)</label>
                <textarea
                  name="eligibility"
                  className="form-textarea"
                  value={schemeForm.eligibility}
                  onChange={handleSchemeChange}
                  placeholder="Eligibility criteria..."
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">How to Apply *</label>
                <textarea
                  name="howToApply"
                  className="form-textarea"
                  value={schemeForm.howToApply}
                  onChange={handleSchemeChange}
                  placeholder="Step-by-step application process"
                  required
                />
              </div>

              {/* Eligibility Questions Section */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Eligibility Questions ({eligibilityQuestions.length})
                  </label>
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => setShowQuestionModal(true)}
                  >
                    + Add Question
                  </button>
                </div>

                {eligibilityQuestions.length > 0 ? (
                  <div>
                    {eligibilityQuestions.map((q, index) => (
                      <div key={index} className="question-card">
                        <div className="question-header">
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)", marginBottom: "0.3rem" }}>
                              Q{index + 1}: {q.question}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--ink-s)" }}>
                              Type: {q.type} • Weight: {q.weight} • {q.required ? "Required" : "Optional"}
                            </div>
                            {q.helpText && (
                              <div style={{ fontSize: "0.75rem", color: "var(--ink-s)", marginTop: "0.3rem", fontStyle: "italic" }}>
                                💡 {q.helpText}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn-danger btn-small"
                            onClick={() => removeEligibilityQuestion(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "var(--bg2)", borderRadius: 8, padding: "1.5rem", textAlign: "center", color: "var(--ink-s)" }}>
                    No eligibility questions added yet. Click "Add Question" to create an interactive eligibility checker.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn-primary">
                  {editingId ? "Update Scheme" : "Add Scheme"}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={resetSchemeForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Schemes List */}
          <div className="form-section">
            <h2 className="sf" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              All Schemes ({schemes.length})
            </h2>

            {loading ? (
              <p style={{ color: "var(--ink-s)" }}>Loading...</p>
            ) : schemes.length === 0 ? (
              <p style={{ color: "var(--ink-s)" }}>No schemes yet. Add one above!</p>
            ) : (
              <div className="items-grid">
                {schemes.map((scheme) => (
                  <div key={scheme._id} className="item-card">
                    <div className="item-header">
                      <div style={{ flex: 1 }}>
                        <div className="item-title">
                          {scheme.icon} {scheme.name}
                        </div>
                        <div className="item-meta">
                          {scheme.category} • {scheme.state} • {scheme.eligibilityQuestions?.length || 0} questions
                        </div>
                      </div>
                      <span
                        style={{
                          background:
                            scheme.status === "active"
                              ? "var(--teal-p)"
                              : "#f0f4f3",
                          color:
                            scheme.status === "active"
                              ? "var(--teal)"
                              : "var(--ink-s)",
                          padding: "4px 12px",
                          borderRadius: "100px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {scheme.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "var(--ink)", marginBottom: "0.8rem" }}>
                      <strong>{scheme.benefit}</strong>
                    </div>

                    <div className="item-actions">
                      <button
                        className="btn-edit"
                        onClick={() => editScheme(scheme)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => deleteScheme(scheme._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* JOBS TAB */}
      {/* ════════════════════════════════════════════════════════ */}

      {activeTab === "jobs" && (
        <>
          {/* Form */}
          <div className="form-section">
            <h2 className="sf" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {editingId ? "Edit Job" : "Add New Job"}
            </h2>

            <form onSubmit={addOrUpdateJob}>
              <div className="two-column">
                {/* Left Column */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={jobForm.title}
                      onChange={handleJobChange}
                      placeholder="e.g., Data Entry Operator"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input
                      type="text"
                      name="company"
                      className="form-input"
                      value={jobForm.company}
                      onChange={handleJobChange}
                      placeholder="Company name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select
                      name="type"
                      className="form-select"
                      value={jobForm.type}
                      onChange={handleJobChange}
                    >
                      <option>Work from Home</option>
                      <option>Part-time · Local</option>
                      <option>Freelance</option>
                      <option>Full-time · Office</option>
                      <option>Contract</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pay</label>
                    <input
                      type="text"
                      name="pay"
                      className="form-input"
                      value={jobForm.pay}
                      onChange={handleJobChange}
                      placeholder="e.g., ₹12,000/mo or ₹350/hr"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      value={jobForm.location}
                      onChange={handleJobChange}
                      placeholder="Remote, City, or Address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select
                      name="duration"
                      className="form-select"
                      value={jobForm.duration}
                      onChange={handleJobChange}
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Flexible</option>
                      <option>Temporary</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon Emoji</label>
                    <input
                      type="text"
                      name="icon"
                      className="form-input"
                      value={jobForm.icon}
                      onChange={handleJobChange}
                      placeholder="💼"
                      maxLength="2"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      className="form-input"
                      value={jobForm.tags}
                      onChange={handleJobChange}
                      placeholder="Remote, Beginner, Writing"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={jobForm.description}
                  onChange={handleJobChange}
                  placeholder="Job description and responsibilities"
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn-primary">
                  {editingId ? "Update Job" : "Add Job"}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={resetJobForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Jobs List */}
          <div className="form-section">
            <h2 className="sf" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              All Jobs ({jobs.length})
            </h2>

            {loading ? (
              <p style={{ color: "var(--ink-s)" }}>Loading...</p>
            ) : jobs.length === 0 ? (
              <p style={{ color: "var(--ink-s)" }}>No jobs yet. Add one above!</p>
            ) : (
              <div className="items-grid">
                {jobs.map((job) => (
                  <div key={job._id} className="item-card">
                    <div className="item-header">
                      <div style={{ flex: 1 }}>
                        <div className="item-title">
                          {job.icon} {job.title}
                        </div>
                        <div className="item-meta">
                          {job.company} • {job.type}
                        </div>
                      </div>
                      <span
                        style={{
                          color: "var(--teal)",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {job.pay}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--ink-s)", marginBottom: "0.8rem" }}>
                      📍 {job.location} • ⏱️ {job.duration}
                    </div>

                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => editJob(job)}>
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => deleteJob(job._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 className="sf" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Add Eligibility Question
              </h3>
              <button className="close-btn" onClick={() => setShowQuestionModal(false)}>
                ×
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Question ID</label>
              <input
                type="text"
                className="form-input"
                value={currentQuestion.id}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, id: e.target.value })}
                placeholder="e.g., q1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea
                className="form-textarea"
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                placeholder="Enter the question"
                style={{ minHeight: "80px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Question Type *</label>
              <select
                className="form-select"
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
              >
                <option value="yes_no">Yes/No</option>
                <option value="age_range">Age Range</option>
                <option value="income_range">Income Range</option>
                <option value="number">Number</option>
                <option value="select">Select (Dropdown)</option>
                <option value="text">Text Input</option>
              </select>
            </div>

            {currentQuestion.type === "select" && (
              <div className="form-group">
                <label className="form-label">Options (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentQuestion.options.join(", ")}
                  onChange={(e) => setCurrentQuestion({ 
                    ...currentQuestion, 
                    options: e.target.value.split(",").map(o => o.trim()) 
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Eligibility Criteria *</label>
              <input
                type="text"
                className="form-input"
                value={currentQuestion.eligibilityCriteria}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, eligibilityCriteria: e.target.value })}
                placeholder={
                  currentQuestion.type === "yes_no" ? '"yes" or "no"' :
                  ["age_range", "income_range", "number"].includes(currentQuestion.type) ? '{"min": 18, "max": 60}' :
                  currentQuestion.type === "select" ? '["option1", "option2"]' : 'Criteria'
                }
              />
              <div style={{ fontSize: "0.75rem", color: "var(--ink-s)", marginTop: "0.3rem" }}>
                {currentQuestion.type === "yes_no" && "Enter 'yes' or 'no'"}
                {["age_range", "income_range", "number"].includes(currentQuestion.type) && "Enter JSON: {\"min\": 18, \"max\": 60}"}
                {currentQuestion.type === "select" && "Enter JSON array: [\"option1\", \"option2\"]"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Help Text</label>
              <textarea
                className="form-textarea"
                value={currentQuestion.helpText}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, helpText: e.target.value })}
                placeholder="Optional guidance for the user"
                style={{ minHeight: "60px" }}
              />
            </div>

            <div className="two-column">
              <div className="form-group">
                <label className="form-label">Weight (1-5)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentQuestion.weight}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, weight: parseInt(e.target.value) })}
                  min="1"
                  max="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required</label>
                <select
                  className="form-select"
                  value={currentQuestion.required.toString()}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.value === "true" })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="btn-primary" onClick={addEligibilityQuestion}>
                Add Question
              </button>
              <button className="btn-secondary" onClick={() => setShowQuestionModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}