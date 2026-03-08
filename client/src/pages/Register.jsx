import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ onRegisterSuccess = null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState(""); // Add form-level error
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", state: "", city: "", terms: false,
  });

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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ""));

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Please enter a valid email";
    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (calculatePasswordStrength(form.password) < 2) newErrors.password = "Password must include uppercase, lowercase, and numbers";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!validatePhone(form.phone)) newErrors.phone = "Please enter a valid phone number";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.terms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: newVal });
    if (touched[name]) validateField(name, newVal);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    const rules = {
      name: () => !value.trim() ? "Full name is required" : value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      email: () => !value.trim() ? "Email is required" : !validateEmail(value) ? "Please enter a valid email" : null,
      password: () => !value.trim() ? "Password is required" : value.length < 8 ? "Password must be at least 8 characters" : calculatePasswordStrength(value) < 2 ? "Include uppercase, lowercase, and numbers" : null,
      phone: () => !value.trim() ? "Phone number is required" : !validatePhone(value) ? "Please enter a valid phone number" : null,
      state: () => !value.trim() ? "State is required" : null,
      city: () => !value.trim() ? "City is required" : null,
    };
    const err = rules[field]?.();
    if (err) newErrors[field] = err;
    else delete newErrors[field];
    setErrors(newErrors);
  };

  const handleBlur = (field) => setTouched({ ...touched, [field]: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); // Clear previous errors
    
    if (!validateStep2()) {
      setFormError("Please fill all required fields correctly");
      return;
    }
    
    setLoading(true);

    try {
      console.log("📤 Sending registration data...", form);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      console.log("📥 Response status:", res.status);

      const data = await res.json();
      console.log("📥 Response data:", data);

      if (!res.ok) {
        const errorMsg = data.message || "Registration failed. Please try again.";
        setFormError(errorMsg);
        setLoading(false);
        console.error("❌ Registration error:", errorMsg);
        return;
      }

      // ✅ Registration successful
      console.log("✅ Registration successful!");

      // Store user info and token
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("✅ Token saved to localStorage");
      }
      
      if (data.name) {
        localStorage.setItem("userName", data.name);
        console.log("✅ User name saved to localStorage");
      }

      // ✅ SAVE ALL REGISTRATION DATA TO localStorage
      localStorage.setItem("userEmail", form.email);
      localStorage.setItem("userPhone", form.phone);
      localStorage.setItem("userState", form.state);
      localStorage.setItem("userCity", form.city);
      console.log("✅ All registration data saved to localStorage", {
        email: form.email,
        phone: form.phone,
        state: form.state,
        city: form.city
      });

      // Call parent callback (optional)
      if (onRegisterSuccess) {
        onRegisterSuccess({ 
          name: form.name,
          email: form.email,
          phone: form.phone,
          state: form.state,
          city: form.city,
          token: data.token
        });
      }

      // Show success animation
      setSuccess(true);
      console.log("🎉 Showing success animation, navigating in 1.4s...");

      // Navigate to dashboard after delay
      setTimeout(() => {
        console.log("🚀 Navigating to /dashboard");
        navigate("/dashboard");
      }, 1400);

    } catch (error) {
      console.error("❌ Network/Server error:", error);
      setFormError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const nextStep = () => { if (validateStep1()) setStep(2); };
  const prevStep = () => { setStep(1); setErrors({}); setFormError(""); };

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

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1c18", minHeight: "100vh", margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; overflow-x: hidden; overflow-y: hidden; }
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
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: "100vh" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ background: "linear-gradient(135deg, #1a6b5a 0%, #134f42 100%)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "clamp(3rem,5vw,4rem)", position: "relative", overflow: "hidden" }}>
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
        <div style={{ background: "#f4f8f6", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "clamp(2rem,4vw,3.5rem)", overflowY: "auto", maxHeight: "100vh", position: "relative" }}>
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

            {/* Form-level error message */}
            {formError && (
              <div style={{ background: "#fff0ee", border: "1px solid #f5c6cb", borderRadius: 10, padding: "10px 14px", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--error)", fontWeight: 500 }}>
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

                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                  {/* Name */}
                  <div className="input-wrapper">
                    <label style={labelStyle}>Full Name</label>
                    <input name="name" placeholder="Priya Sharma" value={form.name} onChange={handleChange} required style={inputStyle("name")}
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-m)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)"; }}
                      onBlur={(e) => { handleBlur("name"); e.target.style.borderColor = hasError("name") ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }} />
                    {hasError("name") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.name}</div>}
                  </div>

                  {/* Email */}
                  <div className="input-wrapper">
                    <label style={labelStyle}>Email Address</label>
                    <input name="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required style={inputStyle("email")}
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-m)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)"; }}
                      onBlur={(e) => { handleBlur("email"); e.target.style.borderColor = hasError("email") ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }} />
                    {hasError("email") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className="input-wrapper">
                    <label style={labelStyle}>Password</label>
                    <input name="password" type="password" placeholder="Enter a strong password" value={form.password} onChange={handleChange} required style={inputStyle("password")}
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-m)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)"; }}
                      onBlur={(e) => { handleBlur("password"); e.target.style.borderColor = hasError("password") ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }} />

                    {form.password && (
                      <div style={{ marginTop: "0.6rem" }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: "0.4rem" }}>
                          {[1,2,3,4,5].map((i) => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= passwordStrength ? strengthInfo.color : "#e0e0e0", transition: "all 0.3s ease" }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.75rem", color: strengthInfo.color, fontWeight: 600 }}>{strengthInfo.label}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--ink-s)" }}>{passwordStrength}/5</span>
                        </div>
                      </div>
                    )}
                    {hasError("password") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.password}</div>}
                  </div>

                  <button type="submit" style={{ width: "100%", padding: "12px 14px", marginTop: "0.5rem", background: "var(--teal)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 2px 8px rgba(26,107,90,0.15)", letterSpacing: "0.01em", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--teal-d)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,107,90,0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--teal)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,107,90,0.15)"; }}>
                    Continue
                  </button>
                </form>

                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink-m)" }}>
                    Already registered?{" "}
                    <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
                      onMouseEnter={(e) => e.target.style.color = "var(--teal-d)"}
                      onMouseLeave={(e) => e.target.style.color = "var(--teal)"}>
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

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                  {/* Phone */}
                  <div className="input-wrapper">
                    <label style={labelStyle}>Phone Number</label>
                    <input name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required style={inputStyle("phone")}
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-m)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)"; }}
                      onBlur={(e) => { handleBlur("phone"); e.target.style.borderColor = hasError("phone") ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }} />
                    {hasError("phone") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.phone}</div>}
                  </div>

                  {/* State + City in a row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className="input-wrapper">
                      <label style={labelStyle}>State</label>
                      <input name="state" placeholder="Maharashtra" value={form.state} onChange={handleChange} required style={inputStyle("state")}
                        onFocus={(e) => { e.target.style.borderColor = "var(--teal-m)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)"; }}
                        onBlur={(e) => { handleBlur("state"); e.target.style.borderColor = hasError("state") ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }} />
                      {hasError("state") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.state}</div>}
                    </div>
                    <div className="input-wrapper">
                      <label style={labelStyle}>City</label>
                      <input name="city" placeholder="Mumbai" value={form.city} onChange={handleChange} required style={inputStyle("city")}
                        onFocus={(e) => { e.target.style.borderColor = "var(--teal-m)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,107,90,0.1)"; }}
                        onBlur={(e) => { handleBlur("city"); e.target.style.borderColor = hasError("city") ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }} />
                      {hasError("city") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.city}</div>}
                    </div>
                  </div>

                  {/* Terms */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "1rem", background: hasError("terms") ? "rgba(220,53,69,0.05)" : "var(--teal-p)", borderRadius: 10, border: hasError("terms") ? "1px solid var(--error)" : "1px solid var(--teal-l)", marginTop: "0.5rem" }}>
                    <input type="checkbox" id="terms" name="terms" checked={form.terms} onChange={handleChange} onBlur={() => handleBlur("terms")} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--teal)", flexShrink: 0, marginTop: 2 }} />
                    <label htmlFor="terms" style={{ fontSize: "0.8rem", color: hasError("terms") ? "var(--error)" : "var(--ink-m)", cursor: "pointer", lineHeight: 1.5, fontWeight: 500 }}>
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>
                  {hasError("terms") && <div className="error-message" style={{ fontSize: "0.75rem", color: "var(--error)", marginTop: "0.4rem", fontWeight: 500 }}>{errors.terms}</div>}

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                    <button type="button" onClick={prevStep} disabled={loading} style={{ flex: 1, padding: "12px 14px", background: "transparent", border: "1.5px solid var(--teal)", borderRadius: 10, color: "var(--teal)", fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: loading ? 0.6 : 1 }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--teal-p)"; }}
                      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "transparent"; }}>
                      Back
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px 14px", background: "var(--teal)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(26,107,90,0.15)", opacity: loading ? 0.8 : 1, letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "var(--teal-d)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,107,90,0.2)"; } }}
                      onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = "var(--teal)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,107,90,0.15)"; } }}>
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

      <style>{`@media (max-width: 900px) { div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}