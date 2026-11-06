import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Vercel par VITE_API_URL set karna zaroori hai (bina last "/" ke)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) =>
  /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ""));

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;
  return strength;
};

const getPasswordStrengthLabel = (strength) => {
  if (strength <= 1) return { label: "Weak", color: "#dc3545" };
  if (strength <= 2) return { label: "Fair", color: "#e8a96a" };
  if (strength <= 3) return { label: "Good", color: "#22896f" };
  return { label: "Strong", color: "#1a6b5a" };
};

// Ek field ka error message (null = sahi hai)
const getFieldError = (field, value) => {
  switch (field) {
    case "name":
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return null;
    case "email":
      if (!value.trim()) return "Email is required";
      if (!validateEmail(value)) return "Please enter a valid email";
      return null;
    case "password":
      if (!value.trim()) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
      if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value))
        return "Include uppercase, lowercase, and a number";
      return null;
    case "phone":
      if (!value.trim()) return "Phone number is required";
      if (!validatePhone(value)) return "Please enter a valid phone number";
      return null;
    case "state":
      return !value.trim() ? "State is required" : null;
    case "city":
      return !value.trim() ? "City is required" : null;
    case "terms":
      return !value ? "You must agree to the terms" : null;
    default:
      return null;
  }
};

const STEP1_FIELDS = ["name", "email", "password"];
const STEP2_FIELDS = ["phone", "state", "city", "terms"];

export default function Register({ onRegisterSuccess = null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", state: "", city: "", terms: false,
  });

  // Diye gaye fields validate karo, sab ko "touched" mark karo taaki errors dikhein
  const validateFields = (fields) => {
    const newErrors = {};
    const newTouched = {};
    fields.forEach((f) => {
      newTouched[f] = true;
      const err = getFieldError(f, form[f]);
      if (err) newErrors[f] = err;
    });
    setTouched((t) => ({ ...t, ...newTouched }));
    setErrors((e) => {
      const merged = { ...e };
      fields.forEach((f) => delete merged[f]);
      return { ...merged, ...newErrors };
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;
    setForm((f) => ({ ...f, [name]: newVal }));
    if (touched[name]) {
      const err = getFieldError(name, newVal);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[name] = err;
        else delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const err = getFieldError(field, form[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const nextStep = () => {
    setFormError("");
    if (validateFields(STEP1_FIELDS)) setStep(2);
  };

  const prevStep = () => {
    setStep(1);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateFields(STEP2_FIELDS)) {
      setFormError("Please fill all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // server ne JSON nahi bheja
      }

      if (!res.ok) {
        setFormError(data.message || data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const userName = data.name || data.user?.name || form.name;

      try {
        if (data.token) localStorage.setItem("token", data.token);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        localStorage.setItem("userPhone", form.phone.trim());
        localStorage.setItem("userState", form.state.trim());
        localStorage.setItem("userCity", form.city.trim());
      } catch {
        // localStorage block ho (private mode) to bhi aage badho
      }

      if (onRegisterSuccess) {
        onRegisterSuccess({
          name: userName,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
          token: data.token,
        });
      }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch {
      setFormError("Unable to connect to server. Please try again in a minute.");
      setLoading(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  const passwordStrength = calculatePasswordStrength(form.password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  const inputStyle = (field) => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: hasError(field) ? "1.5px solid var(--error)" : "1.5px solid var(--border)",
    fontSize: "0.9rem", fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "var(--white)", color: "var(--ink)", outline: "none", transition: "all 0.2s ease",
  });

  const labelStyle = {
    display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)",
    marginBottom: "0.5rem", letterSpacing: "0.02em", textTransform: "uppercase",
  };

  const focusIn = (e) => {
    e.target.style.borderColor = "var(--teal-m)";
    e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)";
  };
  const focusOut = (field) => (e) => {
    handleBlur(field);
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };

  const ErrorText = ({ field }) =>
    hasError(field) ? (
      <div className="error-message" role="alert" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>
        {errors[field]}
      </div>
    ) : null;

  const primaryBtn = {
    padding: "12px 14px", background: "var(--teal)", border: "none", borderRadius: 10,
    color: "#fff", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
    boxShadow: "0 2px 8px rgba(26,107,90,0.15)", letterSpacing: "0.01em", transition: "all 0.2s ease",
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1c18", minHeight: "100vh", margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --teal: #1a6b5a; --teal-d: #134f42; --teal-m: #22896f;
          --teal-l: #c8e6dc; --teal-p: #ebf6f2; --sand: #e8a96a;
          --ink: #0d1c18; --ink-m: #344e44; --ink-s: #6b8c82;
          --border: #d0e6dc; --white: #ffffff; --bg: #f4f8f6;
          --error: #dc3545; --success: #22896f;
        }
        .sf { font-family: 'Fraunces', serif; }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes checkmark { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .input-wrapper { animation: slideUp 0.3s ease forwards; }
        .step-content { animation: slideIn 0.4s ease; }
        .success-icon { animation: checkmark 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .error-message { animation: slideUp 0.2s ease forwards; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        .reg-grid { display: grid; grid-template-columns: 1fr 1fr; width: 100%; min-height: 100vh; }
        .reg-right { max-height: 100vh; overflow-y: auto; }
        @media (max-width: 900px) {
          .reg-grid { grid-template-columns: 1fr; }
          .reg-left { display: none !important; }
          .reg-right { max-height: none; min-height: 100vh; }
        }
        @media (prefers-reduced-motion: reduce) {
          .input-wrapper, .step-content, .error-message, .success-icon { animation: none; }
        }
      `}</style>

      <div className="reg-grid">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left" style={{ background: "linear-gradient(135deg, #1a6b5a 0%, #134f42 100%)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "clamp(3rem,5vw,4rem)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 600, height: 600, background: "rgba(200,230,220,0.08)", filter: "blur(100px)", borderRadius: "50%", bottom: -150, right: -150, zIndex: 0 }} />
          <div style={{ position: "absolute", width: 400, height: 400, background: "rgba(232,169,106,0.05)", filter: "blur(80px)", borderRadius: "50%", top: 50, left: -100, zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
            <div style={{ marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.8rem" }}>Sakhi Support</div>
              <div style={{ width: 40, height: 4, background: "#e8a96a", borderRadius: 2 }} />
            </div>
            <h1 className="sf" style={{ fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 900, marginBottom: "1.2rem", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Start your journey of support
            </h1>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, marginBottom: "2.5rem", opacity: 0.9, maxWidth: 400, fontWeight: 400 }}>
              Join thousands of women accessing government schemes, employment opportunities, and community support.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              {[
                { title: "Government Schemes", desc: "120+ welfare programmes matched to you" },
                { title: "Job Opportunities", desc: "Work-from-home and local employment" },
                { title: "Community Support", desc: "Connect with women on similar journeys" },
                { title: "Expert Guidance", desc: "Access to helplines and legal support" },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(232,169,106,0.3)", border: "1.5px solid rgba(232,169,106,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, background: "#e8a96a", borderRadius: 3 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.3rem" }}>{title}</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.85, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="reg-right" style={{ background: "#f4f8f6", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "clamp(2rem,4vw,3.5rem)", position: "relative" }}>
          {success && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(26,107,90,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, backdropFilter: "blur(4px)" }}>
              <div className="success-icon" style={{ width: 64, height: 64, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600 }}>Account created successfully!</p>
            </div>
          )}

          <div style={{ width: "100%", maxWidth: 400 }}>

            {/* Step dots */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 100, background: step === s ? "var(--teal)" : "var(--border)", transition: "all 0.3s ease" }} />
              ))}
            </div>

            {formError && (
              <div role="alert" style={{ background: "#fff0ee", border: "1px solid #f5c6cb", borderRadius: 10, padding: "10px 14px", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--error)", fontWeight: 500 }}>
                {formError}
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="step-content">
                <div style={{ marginBottom: "2rem" }}>
                  <h2 className="sf" style={{ fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 700, color: "var(--ink)", marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>Create Account</h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink-m)", fontWeight: 400, lineHeight: 1.5 }}>Your information is encrypted and secure</p>
                </div>

                <form noValidate onSubmit={(e) => { e.preventDefault(); nextStep(); }} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                  <div className="input-wrapper">
                    <label htmlFor="name" style={labelStyle}>Full Name</label>
                    <input id="name" name="name" autoComplete="name" placeholder="Priya Sharma" value={form.name} onChange={handleChange} style={inputStyle("name")} onFocus={focusIn} onBlur={focusOut("name")} />
                    <ErrorText field="name" />
                  </div>

                  <div className="input-wrapper">
                    <label htmlFor="email" style={labelStyle}>Email Address</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={handleChange} style={inputStyle("email")} onFocus={focusIn} onBlur={focusOut("email")} />
                    <ErrorText field="email" />
                  </div>

                  <div className="input-wrapper">
                    <label htmlFor="password" style={labelStyle}>Password</label>
                    <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Enter a strong password" value={form.password} onChange={handleChange} style={inputStyle("password")} onFocus={focusIn} onBlur={focusOut("password")} />

                    {form.password && (
                      <div style={{ marginTop: "0.6rem" }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: "0.4rem" }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= passwordStrength ? strengthInfo.color : "#e0e0e0", transition: "all 0.3s ease" }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.75rem", color: strengthInfo.color, fontWeight: 600 }}>{strengthInfo.label}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--ink-s)" }}>{passwordStrength}/5</span>
                        </div>
                      </div>
                    )}
                    <ErrorText field="password" />
                  </div>

                  <button
                    type="submit"
                    style={{ ...primaryBtn, width: "100%", marginTop: "0.5rem" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--teal-d)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--teal)"; }}
                  >
                    Continue
                  </button>
                </form>

                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink-m)" }}>
                    Already registered?{" "}
                    <button type="button" onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                      Log in
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="step-content">
                <div style={{ marginBottom: "2rem" }}>
                  <h2 className="sf" style={{ fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 700, color: "var(--ink)", marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>Your Location</h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink-m)", fontWeight: 400, lineHeight: 1.5 }}>This helps us connect you with local opportunities</p>
                </div>

                <form noValidate onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                  <div className="input-wrapper">
                    <label htmlFor="phone" style={labelStyle}>Phone Number</label>
                    <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} style={inputStyle("phone")} onFocus={focusIn} onBlur={focusOut("phone")} />
                    <ErrorText field="phone" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className="input-wrapper">
                      <label htmlFor="state" style={labelStyle}>State</label>
                      <input id="state" name="state" placeholder="Maharashtra" value={form.state} onChange={handleChange} style={inputStyle("state")} onFocus={focusIn} onBlur={focusOut("state")} />
                      <ErrorText field="state" />
                    </div>
                    <div className="input-wrapper">
                      <label htmlFor="city" style={labelStyle}>City</label>
                      <input id="city" name="city" placeholder="Pune" value={form.city} onChange={handleChange} style={inputStyle("city")} onFocus={focusIn} onBlur={focusOut("city")} />
                      <ErrorText field="city" />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem", background: hasError("terms") ? "rgba(220,53,69,0.05)" : "var(--teal-p)", borderRadius: 10, border: hasError("terms") ? "1px solid var(--error)" : "1px solid var(--teal-l)", marginTop: "0.5rem" }}>
                    <input type="checkbox" id="terms" name="terms" checked={form.terms} onChange={handleChange} onBlur={() => handleBlur("terms")} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--teal)", flexShrink: 0, marginTop: 2 }} />
                    <label htmlFor="terms" style={{ fontSize: "0.8rem", color: hasError("terms") ? "var(--error)" : "var(--ink-m)", cursor: "pointer", lineHeight: 1.5, fontWeight: 500 }}>
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>
                  <ErrorText field="terms" />

                  <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={loading}
                      style={{ flex: 1, padding: "12px 14px", background: "transparent", border: "1.5px solid var(--teal)", borderRadius: 10, color: "var(--teal)", fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: loading ? 0.6 : 1 }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ ...primaryBtn, flex: 1, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                    >
                      {loading && <div className="spinner" />}
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}