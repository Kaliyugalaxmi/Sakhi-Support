import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Vercel par VITE_API_URL set karna zaroori hai (bina last "/" ke)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getFieldError = (field, value) => {
  if (field === "email") {
    if (!value.trim()) return "Email is required";
    if (!validateEmail(value)) return "Please enter a valid email";
  }
  if (field === "password") {
    if (!value.trim()) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
  }
  return null;
};

export default function Login({ onLoginSuccess = null }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  const values = { email, password };

  const setFieldError = (field, value) => {
    const err = getFieldError(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    ["email", "password"].forEach((f) => {
      const err = getFieldError(f, values[f]);
      if (err) newErrors[f] = err;
    });
    // Submit par dono fields "touched" mark karo taaki errors dikhein
    setTouched({ email: true, password: true });
    setErrors((prev) => ({ form: prev.form, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldError(field, values[field]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, form: undefined }));
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // server ne JSON nahi bheja
      }

      if (res.ok) {
        const userName = data.name || data.user?.name || "User";

        // ✅ Token aur naam save karo (dashboard ke liye zaroori)
        try {
          if (data.token) localStorage.setItem("token", data.token);
          localStorage.setItem("userName", userName);
        } catch {
          // localStorage block ho (private mode) to bhi aage badho
        }

        if (onLoginSuccess) {
          onLoginSuccess({ name: userName, token: data.token });
        }

        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 1400);
      } else {
        setLoading(false);
        setErrors({ form: data.message || data.error || "Invalid email or password" });
      }
    } catch {
      setLoading(false);
      setErrors({ form: "Unable to connect. Please try again in a minute." });
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  const inputStyle = (field) => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: hasError(field) ? "1.5px solid var(--error)" : "1.5px solid var(--border)",
    fontSize: "0.9rem", fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "var(--white)", color: "var(--ink)", outline: "none", transition: "all 0.2s ease",
  });

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
        @keyframes checkmark {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .input-wrapper { animation: slideUp 0.3s ease forwards; }
        .success-icon { animation: checkmark 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .error-message { animation: slideUp 0.2s ease forwards; }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        .login-grid { display: grid; grid-template-columns: 1fr 1fr; width: 100%; min-height: 100vh; }
        @media (max-width: 900px) {
          .login-grid { grid-template-columns: 1fr; }
          .login-left { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .input-wrapper, .error-message, .success-icon { animation: none; }
        }
      `}</style>

      <div className="login-grid">

        {/* ── LEFT PANEL ── */}
        <div className="login-left" style={{
          background: "linear-gradient(135deg, #1a6b5a 0%, #134f42 100%)",
          color: "#fff", display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "flex-start",
          padding: "clamp(3rem, 5vw, 4rem)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", width: 600, height: 600, background: "rgba(200,230,220,0.08)", filter: "blur(100px)", borderRadius: "50%", bottom: -150, right: -150, zIndex: 0 }} />
          <div style={{ position: "absolute", width: 400, height: 400, background: "rgba(232,169,106,0.05)", filter: "blur(80px)", borderRadius: "50%", top: 50, left: -100, zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "420px" }}>
            <div style={{ marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.8rem" }}>
                Sakhi Support
              </div>
              <div style={{ width: 40, height: 4, background: "#e8a96a", borderRadius: 2 }} />
            </div>

            <h1 className="sf" style={{ fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 900, marginBottom: "1.2rem", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, marginBottom: "2.5rem", opacity: 0.9, maxWidth: 400, fontWeight: 400 }}>
              Access government schemes, job opportunities, and community support all in one place.
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
        <div style={{
          background: "#f4f8f6", display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          padding: "clamp(2rem,4vw,3.5rem)", position: "relative", overflow: "hidden",
        }}>
          {success && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(26,107,90,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, backdropFilter: "blur(4px)" }}>
              <div className="success-icon" style={{ width: 64, height: 64, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600 }}>Login successful!</p>
            </div>
          )}

          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ marginBottom: "2.2rem" }}>
              <h2 className="sf" style={{ fontSize: "clamp(1.8rem,3vw,2.2rem)", fontWeight: 700, color: "var(--ink)", marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>
                Log In
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-m)", fontWeight: 400, lineHeight: 1.5 }}>
                Access your account to continue your journey with us
              </p>
            </div>

            {errors.form && (
              <div role="alert" style={{ background: "#fff0ee", border: "1px solid #f5c6cb", borderRadius: 10, padding: "10px 14px", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--error)", fontWeight: 500 }}>
                {errors.form}
              </div>
            )}

            <form noValidate onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

              {/* Email */}
              <div className="input-wrapper">
                <label htmlFor="email" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.5rem", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setFieldError("email", e.target.value);
                  }}
                  style={inputStyle("email")}
                  onFocus={focusIn}
                  onBlur={focusOut("email")}
                />
                <ErrorText field="email" />
              </div>

              {/* Password */}
              <div className="input-wrapper">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label htmlFor="password" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)", letterSpacing: "0.02em", textTransform: "uppercase" }}>Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) setFieldError("password", e.target.value);
                  }}
                  style={inputStyle("password")}
                  onFocus={focusIn}
                  onBlur={focusOut("password")}
                />
                <ErrorText field="password" />
              </div>

              {/* Forgot */}
              <div style={{ textAlign: "right" }}>
                <button type="button" style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "color 0.2s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--teal-d)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--teal)")}>
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "12px 14px", marginTop: "0.5rem", background: "var(--teal)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(26,107,90,0.15)", opacity: loading ? 0.8 : 1, letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "var(--teal-d)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,107,90,0.2)"; } }}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = "var(--teal)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,107,90,0.15)"; } }}
              >
                {loading && <div className="spinner" />}
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div style={{ marginTop: "1.8rem", paddingTop: "1.8rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-m)", lineHeight: 1.6 }}>
                Don't have an account?{" "}
                <button type="button" onClick={() => navigate("/register")} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "color 0.2s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--teal-d)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--teal)")}>
                  Join us today
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}