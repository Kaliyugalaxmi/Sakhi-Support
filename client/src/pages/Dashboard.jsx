import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Community from "./Community";
import Helplines from "./Helplines";
import Schemes from "./Schemes";
import Jobs from "./Jobs";
import Profile from "./Profile";

const SCHEMES = [
  { icon: "🏥", title: "PM Matru Vandana", tag: "Health", status: "Eligible" },
  { icon: "📚", title: "Widow Scholarship Scheme", tag: "Education", status: "Apply Now" },
  { icon: "🏠", title: "Pradhan Mantri Awas Yojana", tag: "Housing", status: "Eligible" },
  { icon: "💰", title: "National Widow Pension", tag: "Finance", status: "Pending" },
];

const JOBS = [
  { title: "Data Entry Operator", company: "TechAssist India", type: "Work from Home", pay: "₹12,000/mo" },
  { title: "Tailoring Instructor", company: "NGO Craft Hub", type: "Part-time · Local", pay: "₹8,500/mo" },
  { title: "Online Tutor (Hindi)", company: "EduBridge", type: "Freelance", pay: "₹350/hr" },
];

const HELPLINES = [
  { icon: "📞", num: "181", label: "Women Helpline", sub: "24×7 · Free" },
  { icon: "🆘", num: "1091", label: "Distress Line", sub: "Immediate help" },
  { icon: "⚖️", num: "15100", label: "Legal Aid", sub: "Free guidance" },
];

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", id: "dashboard" },
  { icon: "🏛️", label: "Schemes", id: "schemes" },
  { icon: "💼", label: "Jobs", id: "jobs" },
  { icon: "🤝", label: "Community", id: "community" },
  { icon: "📞", label: "Helplines", id: "helplines" },
  
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "User");
  const [greeting, setGreeting] = useState("Good morning");
  
  // ✅ NEW: Store all registration data
  const [userSession, setUserSession] = useState({
    userName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    token: "",
  });useEffect(() => {
  console.log("📥 Dashboard mounted - Loading user data from localStorage");
  
  // ✅ Load all user data from localStorage (set by Register.jsx)
  const stored = {
    userName: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "",
    phone: localStorage.getItem("userPhone") || "",
    state: localStorage.getItem("userState") || "",
    city: localStorage.getItem("userCity") || "",
    token: localStorage.getItem("token") || "",
  };

  console.log("📦 Loaded from localStorage:", stored);

  setUserName(stored.userName);
  setUserSession(stored);

  // Also fetch from backend to get latest data
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("⚠️  No token found, skipping backend fetch");
        return;
      }
      
      console.log("🔄 Fetching user data from backend...");
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        const name = data.user?.name || data.name;
        if (name) {
          console.log("✅ Backend returned user data");
          setUserName(name);
          setUserSession(prev => ({ ...prev, userName: name }));
        }
      }
    } catch (error) {
      console.error("⚠️  Backend fetch error (non-critical):", error.message);
      // Don't fail - use localStorage data instead
    }
  };
  
  fetchUser();

  // Set greeting based on time of day
  const hour = new Date().getHours();
  if (hour < 12) setGreeting("Good morning");
  else if (hour < 17) setGreeting("Good afternoon");
  else setGreeting("Good evening");

  console.log("✅ Dashboard useEffect complete");
}, []);

  const firstName = userName.split(" ")[0];
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ✅ NEW: Capture registration data
  const handleRegisterSuccess = (data) => {
    console.log("✅ Dashboard received registration data:", data);
    
    setUserName(data.name);
    setUserSession({
      userName: data.name,
      email: data.email || "",
      phone: data.phone || "",
      state: data.state || "",
      city: data.city || "",
      token: data.token || "",
    });

    // Save to localStorage
    localStorage.setItem("userName", data.name);
    if (data.email) localStorage.setItem("userEmail", data.email);
    if (data.phone) localStorage.setItem("userPhone", data.phone);
    if (data.state) localStorage.setItem("userState", data.state);
    if (data.city) localStorage.setItem("userCity", data.city);
    if (data.token) localStorage.setItem("token", data.token);
  };

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1c18", display: "flex", height: "100vh", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --teal: #1a6b5a; --teal-d: #134f42; --teal-m: #22896f;
          --teal-l: #c8e6dc; --teal-p: #ebf6f2;
          --sand: #e8a96a; --sand-l: #fdf3e7;
          --ink: #0d1c18; --ink-m: #344e44; --ink-s: #6b8c82;
          --border: #d0e6dc; --white: #ffffff; --bg: #f4f8f6; --bg2: #edf5f1;
        }
        .sf { font-family: 'Fraunces', serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--teal-p); }
        ::-webkit-scrollbar-thumb { background: #88c4b4; border-radius: 3px; }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px; cursor: pointer;
          font-size: 0.875rem; font-weight: 500; color: var(--ink-m);
          border: none; background: none; width: 100%; text-align: left;
          transition: all 0.18s ease; letter-spacing: 0.01em;
        }
        .nav-item:hover { background: var(--teal-p); color: var(--teal); }
        .nav-item.active { background: var(--teal); color: #fff; font-weight: 600; }

        .card {
          background: var(--white); border-radius: 16px;
          border: 1px solid var(--border); overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .card:hover { box-shadow: 0 8px 30px rgba(13,28,24,0.08); transform: translateY(-2px); }

        .stat-card {
          background: var(--white); border-radius: 14px;
          border: 1px solid var(--border); padding: 1.4rem 1.6rem;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover { box-shadow: 0 6px 24px rgba(13,28,24,0.07); transform: translateY(-2px); }

        .badge {
          display: inline-block; padding: 3px 10px; border-radius: 100px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
        }
        .badge-green { background: #ebf6f2; color: #1a6b5a; border: 1px solid #c8e6dc; }
        .badge-sand  { background: #fdf3e7; color: #c47a28; border: 1px solid #f5d9aa; }
        .badge-grey  { background: #f0f4f3; color: #6b8c82; border: 1px solid #d0e6dc; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .a1 { animation: fadeUp .5s 0s   both; }
        .a2 { animation: fadeUp .5s .08s both; }
        .a3 { animation: fadeUp .5s .16s both; }
        .a4 { animation: fadeUp .5s .24s both; }
        .a5 { animation: fadeUp .5s .32s both; }

        .logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px; cursor: pointer;
          font-size: 0.875rem; font-weight: 500; color: #b84030;
          border: none; background: none; width: 100%; text-align: left;
          transition: all 0.18s ease;
        }
        .logout-btn:hover { background: #fff0ee; }

        .user-profile-btn {
          display: flex; align-items: center; gap: 10px; padding: 8px 14px; margin-bottom: 6px;
          cursor: pointer; border-radius: 10px; border: none; background: transparent;
          transition: all 0.2s ease; width: 100%; text-align: left;
        }
        .user-profile-btn:hover { background: var(--teal-p); }

        .scheme-row { transition: background 0.15s; border-radius: 10px; }
        .scheme-row:hover { background: var(--teal-p) !important; }

        .job-row { transition: background 0.15s; border-radius: 10px; }
        .job-row:hover { background: var(--teal-p) !important; }

        .helpline-card { transition: all 0.2s; }
        .helpline-card:hover { border-color: var(--teal) !important; background: var(--teal-p) !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 230,
        minWidth: 230,
        background: "var(--white)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "1.6rem 0.85rem",
        overflow: "hidden",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.2rem", paddingLeft: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--teal)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(26,107,90,0.25)",
          }}>🌿</div>
          <span className="sf" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            Sakhi <span style={{ color: "var(--teal)" }}>Support</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(({ icon, label, id }) => (
            <button
              key={id}
              className={`nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => setActiveNav(id)}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
              <span style={{ whiteSpace: "nowrap" }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem" }}>
          {/* Profile Section - Clickable */}
          <button 
            className="user-profile-btn"
            onClick={() => setActiveNav("profile")}
            title="Go to Profile"
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--teal), var(--teal-m))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0,
              boxShadow: "0 2px 6px rgba(26,107,90,0.2)",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{firstName}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--ink-s)" }}>Member</div>
            </div>
          </button>

          {/* Logout Button */}
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Log out from your account"
          >
            <span style={{ fontSize: "1rem" }}>↩</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

        {/* CONTENT - MAIN CONDITIONAL RENDERING */}
        {activeNav === "profile" ? (
          // ✅ PASS ALL DATA TO PROFILE
          <Profile 
            userName={userSession.userName}
            email={userSession.email}
            phone={userSession.phone}
            state={userSession.state}
            city={userSession.city}
            token={userSession.token}
          />
        ) : activeNav === "community" ? (
          <Community userName={userName} token={localStorage.getItem("token")} />
        ) : activeNav === "helplines" ? (
          <Helplines />
        ) : activeNav === "schemes" ? (
          <Schemes />
        ) : activeNav === "jobs" ? (
          <Jobs />
        ) : (
          // DEFAULT DASHBOARD VIEW
          <div style={{ padding: "2rem 2rem 3rem", width: "100%" }}>
            {/* ── GREETING BANNER ── */}
            <div className="a1" style={{
              background: "linear-gradient(120deg, var(--teal) 0%, var(--teal-m) 100%)",
              borderRadius: 20, padding: "2rem 2.5rem", marginBottom: "2rem",
              position: "relative", overflow: "hidden", color: "#fff",
            }}>
              <div style={{ position: "absolute", width: 300, height: 300, background: "rgba(255,255,255,0.06)", borderRadius: "50%", right: -60, top: -80 }} />
              <div style={{ position: "absolute", width: 180, height: 180, background: "rgba(255,255,255,0.04)", borderRadius: "50%", right: 120, bottom: -80 }} />
              <div style={{ position: "absolute", width: 120, height: 120, background: "rgba(232,169,106,0.12)", borderRadius: "50%", left: -30, bottom: -40 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.75, marginBottom: 6 }}>
                  {greeting}
                </div>
                <h1 className="sf" style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 10 }}>
                  Welcome back, <em>{firstName}!</em>
                </h1>
                <p style={{ fontSize: "0.9rem", opacity: 0.88, lineHeight: 1.7, maxWidth: 520 }}>
                  You have <strong>3 new scheme matches</strong> and <strong>2 job opportunities</strong> waiting for you today.
                </p>
                <div style={{ marginTop: "1.2rem", display: "flex", gap: "0.75rem" }}>
                  <div onClick={() => setActiveNav("schemes")} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                    View Schemes →
                  </div>
                  <div onClick={() => setActiveNav("jobs")} style={{ background: "rgba(232,169,106,0.3)", border: "1px solid rgba(232,169,106,0.4)", borderRadius: 8, padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                    Browse Jobs →
                  </div>
                </div>
              </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="a2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { icon: "🏛️", val: "12", label: "Eligible Schemes",  sub: "+3 new",      accent: "var(--teal)"  },
                { icon: "💼", val: "7",  label: "Job Matches",        sub: "2 near you",  accent: "#4a60a0"      },
                { icon: "🤝", val: "48", label: "Community Posts",    sub: "5 replies",   accent: "var(--sand)"  },
                { icon: "📋", val: "2",  label: "Applications",       sub: "In progress", accent: "#b84030"      },
              ].map(({ icon, val, label, sub, accent }) => (
                <div key={label} className="stat-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{icon}</div>
                    <div style={{ fontSize: "0.7rem", color: accent, fontWeight: 700, background: accent + "18", padding: "3px 8px", borderRadius: 6 }}>{sub}</div>
                  </div>
                  <div style={{ fontSize: "1.9rem", fontWeight: 900, color: accent, lineHeight: 1, marginBottom: 4 }}>{val}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--ink-s)", fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* ── TWO COLUMNS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.4rem", marginBottom: "1.4rem" }}>

              {/* Schemes */}
              <div className="card a3">
                <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>Government Schemes</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-s)", marginTop: 2 }}>Matched to your profile</div>
                  </div>
                  <button onClick={() => setActiveNav("schemes")} style={{ background: "var(--teal-p)", color: "var(--teal)", border: "1px solid var(--teal-l)", borderRadius: 8, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>View All</button>
                </div>
                <div style={{ padding: "0.8rem 1rem" }}>
                  {SCHEMES.map(({ icon, title, tag, status }) => (
                    <div key={title} className="scheme-row" style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.85rem 0.6rem", borderBottom: "1px solid var(--bg2)", cursor: "pointer", background: "transparent" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--ink-s)" }}>{tag}</div>
                      </div>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700, background: status === "Eligible" ? "#ebf6f2" : status === "Apply Now" ? "#fdf3e7" : "#f0f4f3", color: status === "Eligible" ? "#1a6b5a" : status === "Apply Now" ? "#c47a28" : "#6b8c82" }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs Preview */}
              <div className="card a4">
                <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>Job Opportunities</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-s)", marginTop: 2 }}>Curated for you</div>
                  </div>
                  <button onClick={() => setActiveNav("jobs")} style={{ background: "var(--teal-p)", color: "var(--teal)", border: "1px solid var(--teal-l)", borderRadius: 8, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Browse</button>
                </div>
                <div style={{ padding: "0.8rem 1rem" }}>
                  {JOBS.map(({ title, company, type, pay }) => (
                    <div key={title} className="job-row" style={{ padding: "0.95rem 0.6rem", borderBottom: "1px solid var(--bg2)", cursor: "pointer", background: "transparent" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--ink)" }}>{title}</div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--teal)", flexShrink: 0, marginLeft: 8 }}>{pay}</div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--ink-s)" }}>{company} · {type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── HELPLINES ROW ── */}
            <div className="a5" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
              {HELPLINES.map(({ icon, num, label, sub }) => (
                <div key={num} className="helpline-card" style={{
                  background: "var(--white)", borderRadius: 14, border: "1px solid var(--border)",
                  padding: "1.4rem 1.6rem", display: "flex", alignItems: "center", gap: "1.1rem", cursor: "pointer",
                }}>
                  <div style={{ fontSize: "1.6rem" }}>{icon}</div>
                  <div>
                    <div className="sf" style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--teal)", lineHeight: 1 }}>{num}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--ink)", marginTop: 2 }}>{label}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-s)" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}