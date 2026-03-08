import { useState, useEffect } from "react";

const API = "http://localhost:5000/api/schemes";

const LIFE_STAGES = [
  { id: "all",       label: "All Stages" },
  { id: "unmarried", label: "Unmarried / Young" },
  { id: "pregnant",  label: "Pregnant" },
  { id: "mother",    label: "Mother" },
  { id: "married",   label: "Married" },
  { id: "widow",     label: "Widow" },
  { id: "senior",    label: "Senior (60+)" },
  { id: "single",    label: "Single / Independent" },
];

const CATEGORIES = [
  "All Categories", "Health", "Education", "Finance",
  "Housing", "Skill Development", "Safety", "Legal",
];

const CAT_COLORS = {
  Health:             { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  Education:          { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  Finance:            { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
  Housing:            { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" },
  "Skill Development":{ bg: "#fce4ec", color: "#c2185b", border: "#f48fb1" },
  Safety:             { bg: "#fff0f0", color: "#d32f2f", border: "#ef9a9a" },
  Legal:              { bg: "#f1f8e9", color: "#558b2f", border: "#c5e1a5" },
};

// SVG helpers
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg className={`chevron${open ? " open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default function Schemes() {
  const [schemes, setSchemes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lifeStage, setLifeStage] = useState("all");
  const [category, setCategory]   = useState("All Categories");
  const [search, setSearch]       = useState("");
  const [stats, setStats]         = useState({ total: 0, byCategory: {} });
  const [expandedId, setExpandedId] = useState(null);

  // Detail modal
  const [detailScheme, setDetailScheme] = useState(null);

  // Eligibility checker
  const [eligScheme,  setEligScheme]  = useState(null);
  const [qIndex,      setQIndex]      = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [result,      setResult]      = useState(null);
  const [showResult,  setShowResult]  = useState(false);

  // ── Data fetching ─────────────────────────────────────
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const p = new URLSearchParams();
      if (category !== "All Categories") p.append("category", category);
      if (lifeStage !== "all")           p.append("lifeStage", lifeStage);
      if (search.trim())                 p.append("search", search.trim());

      const res  = await fetch(`${API}?${p}`);
      const data = await res.json();
      if (data.success) setSchemes(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${API}/stats/counts`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchSchemes(); fetchStats(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchSchemes, 280);
    return () => clearTimeout(t);
  }, [lifeStage, category, search]);

  // ── Eligibility helpers ───────────────────────────────
  const openElig = (s) => {
    setEligScheme(s); setQIndex(0); setAnswers({});
    setResult(null);  setShowResult(false);
  };
  const closeElig = () => {
    setEligScheme(null); setQIndex(0); setAnswers({});
    setResult(null);     setShowResult(false);
  };
  const answer = (id, val) => setAnswers((p) => ({ ...p, [id]: val }));

  const submitElig = async () => {
    try {
      const res  = await fetch(`${API}/${eligScheme._id}/check-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success) { setResult(data); setShowResult(true); }
    } catch (e) { console.error(e); }
  };

  const nextQ = () => {
    const total = eligScheme?.eligibilityQuestions?.length || 0;
    if (qIndex < total - 1) setQIndex((p) => p + 1);
    else submitElig();
  };

  const currentQ  = eligScheme?.eligibilityQuestions?.[qIndex];
  const totalQs   = eligScheme?.eligibilityQuestions?.length || 0;

  const remoteCount = schemes.filter(
    (s) => s.state === "All India"
  ).length;

  return (
    <div style={{ background: "var(--bg)", fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        :root {
          --teal:#1a6b5a; --teal-d:#134f42; --teal-m:#22896f;
          --teal-l:#c8e6dc; --teal-p:#ebf6f2; --sand:#e8a96a;
          --ink:#0d1c18; --ink-m:#344e44; --ink-s:#6b8c82;
          --border:#d0e6dc; --white:#ffffff; --bg:#f4f8f6; --bg2:#edf5f1;
        }
        .sf { font-family:'Fraunces',serif; }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes scaleIn    { from{opacity:0;transform:scale(.96)}       to{opacity:1;transform:none} }
        @keyframes expandDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        @keyframes shimmer    { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .pw { max-width:1080px; margin:0 auto; padding:2.5rem 2rem 4rem; }

        /* header */
        .ph h1 { font-family:'Fraunces',serif; font-size:2.2rem; font-weight:900; color:var(--ink); margin:0 0 .3rem; letter-spacing:-.03em; line-height:1.1; }
        .ph p  { font-size:.88rem; color:var(--ink-s); margin:0; font-weight:500; }

        /* stat chips */
        .stat-row  { display:flex; gap:.55rem; flex-wrap:wrap; margin-bottom:1.7rem; }
        .stat-chip { background:var(--white); border:1px solid var(--border); border-radius:8px;
                      padding:6px 12px; font-size:.75rem; font-weight:600; color:var(--ink-m);
                      display:flex; align-items:center; gap:5px; }
        .stat-chip strong { color:var(--teal); font-weight:800; }

        /* search */
        .sw { position:relative; margin-bottom:1.2rem; }
        .si-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--ink-s); pointer-events:none; }
        .si {
          width:100%; padding:11px 13px 11px 39px; border-radius:11px;
          border:1.5px solid var(--border); font-size:.87rem;
          font-family:'Plus Jakarta Sans',sans-serif; color:var(--ink);
          background:var(--white); transition:all .2s;
        }
        .si:focus { outline:none; border-color:var(--teal); box-shadow:0 0 0 3px rgba(26,107,90,.08); }
        .si::placeholder { color:var(--ink-s); }

        /* filter chips */
        .fr { display:flex; gap:.38rem; flex-wrap:wrap; align-items:center; margin-bottom:1rem; }
        .fl { font-size:.71rem; font-weight:700; color:var(--ink-s); text-transform:uppercase;
               letter-spacing:.07em; margin-right:.3rem; white-space:nowrap; }
        .fc {
          padding:5px 13px; border-radius:100px; border:1.5px solid var(--border);
          background:var(--white); color:var(--ink-m); font-size:.75rem; font-weight:600;
          cursor:pointer; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; white-space:nowrap;
        }
        .fc:hover  { border-color:var(--teal-l); background:var(--teal-p); color:var(--teal); }
        .fc.on     { background:var(--teal); color:#fff; border-color:var(--teal); }

        /* layout */
        .ml { display:grid; grid-template-columns:1fr 282px; gap:1.4rem; align-items:start; }
        @media(max-width:860px) { .ml{grid-template-columns:1fr} .psb{display:none} }

        /* card */
        .card {
          background:var(--white); border:1.5px solid var(--border); border-radius:14px;
          padding:1.3rem 1.4rem; margin-bottom:.85rem; cursor:pointer;
          animation:fadeUp .3s ease both; transition:all .2s;
        }
        .card:hover      { box-shadow:0 6px 24px rgba(13,28,24,.09); transform:translateY(-2px); border-color:var(--teal-l); }
        .card.exp        { border-color:var(--teal); box-shadow:0 6px 24px rgba(26,107,90,.11); }

        /* card icon */
        .c-icon { font-size:2rem; flex-shrink:0; line-height:1; }
        .c-name { font-size:.98rem; font-weight:700; color:var(--ink); margin-bottom:.3rem; line-height:1.3; }
        .c-val  { font-family:'Fraunces',serif; font-size:1.1rem; font-weight:900; color:var(--teal); margin-bottom:.45rem; }
        .c-desc { font-size:.81rem; color:var(--ink-s); line-height:1.6; margin-bottom:.6rem; }
        .badge  { padding:3px 10px; border-radius:100px; font-size:.67rem; font-weight:700; flex-shrink:0; }

        /* meta */
        .cmr   { display:flex; gap:.9rem; flex-wrap:wrap; }
        .mi    { display:flex; align-items:center; gap:4px; font-size:.75rem; color:var(--ink-s); font-weight:500; }

        /* expanded */
        .cxb { padding:1.25rem 1.4rem; border-top:1.5px solid var(--border); background:var(--bg); animation:expandDown .2s ease; }
        .cxdesc { font-size:.83rem; color:var(--ink-m); line-height:1.7; margin-bottom:1.1rem; }
        .elig-items { background:var(--white); border-radius:10px; border:1px solid var(--border); padding:.85rem .95rem; margin-bottom:1.1rem; }
        .elig-item  { display:flex; gap:8px; align-items:flex-start; padding:6px 0; border-bottom:1px solid var(--bg2); font-size:.81rem; color:var(--ink); }
        .elig-item:last-child { border-bottom:none; }
        .elig-check { color:var(--teal); font-weight:700; flex-shrink:0; margin-top:1px; }
        .doc-chips  { display:flex; flex-wrap:wrap; gap:.4rem; margin-bottom:1.1rem; }
        .doc-chip   { background:var(--teal-p); color:var(--teal); border:1px solid var(--teal-l); padding:4px 11px; border-radius:100px; font-size:.73rem; font-weight:600; }

        /* actions */
        .ar   { display:flex; gap:.6rem; flex-wrap:wrap; }
        .bp   { background:var(--teal); color:#fff; border:none; padding:9px 18px; border-radius:9px; font-weight:700; font-size:.79rem; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .bp:hover    { background:var(--teal-d); transform:translateY(-1px); }
        .bp:disabled { opacity:.45; cursor:not-allowed; transform:none; }
        .bo   { background:transparent; color:var(--teal); border:1.5px solid var(--teal); padding:9px 16px; border-radius:9px; font-weight:700; font-size:.79rem; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .bo:hover    { background:var(--teal-p); }
        .bg   { background:transparent; color:var(--ink-m); border:1.5px solid var(--border); padding:9px 16px; border-radius:9px; font-weight:600; font-size:.79rem; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .bg:hover    { background:var(--white); border-color:var(--teal-l); }

        .chevron      { transition:transform .2s; color:var(--ink-s); flex-shrink:0; }
        .chevron.open { transform:rotate(180deg); }

        /* skeleton */
        .sk { background:linear-gradient(90deg,#e8f0ec 25%,#d4e8de 50%,#e8f0ec 75%);
               background-size:200%; animation:shimmer 1.5s infinite; border-radius:6px; }

        /* sidebar */
        .sbc { background:var(--white); border:1.5px solid var(--border); border-radius:14px; padding:1.2rem; margin-bottom:.9rem; }
        .sbt { font-size:.71rem; font-weight:700; color:var(--ink); text-transform:uppercase; letter-spacing:.07em; margin-bottom:.8rem; }
        .sbr { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid var(--bg2); }
        .sbr:last-child { border-bottom:none; }
        .sbl { font-size:.76rem; color:var(--ink-s); font-weight:500; }
        .sbv { font-size:.79rem; font-weight:800; color:var(--teal); }
        .tc  { background:var(--teal); border-radius:14px; padding:1.2rem; color:#fff; }
        .tct { font-size:.71rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; opacity:.6; margin-bottom:.8rem; }
        .ti  { display:flex; gap:7px; margin-bottom:.5rem; font-size:.76rem; opacity:.88; line-height:1.5; }
        .tb  { color:var(--sand); font-weight:700; flex-shrink:0; }

        /* modal */
        .ov  { position:fixed; inset:0; background:rgba(13,28,24,.55); backdrop-filter:blur(5px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
        .mb  { background:var(--white); border-radius:20px; max-width:640px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(13,28,24,.22); animation:scaleIn .22s ease; }
        .mh  { padding:1.4rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; }
        .mbdy{ padding:1.4rem; }
        .xb  { width:29px; height:29px; border-radius:50%; background:var(--bg2); border:none; cursor:pointer; font-size:1rem; color:var(--ink-m); display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
        .xb:hover { background:var(--border); }
        .sl  { font-size:.67rem; font-weight:700; color:var(--ink-s); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem; }

        /* progress */
        .prb  { height:4px; background:var(--bg2); border-radius:10px; overflow:hidden; margin-top:.45rem; }
        .prf  { height:100%; background:linear-gradient(90deg,var(--teal),var(--teal-m)); transition:width .3s; }

        /* radio */
        .ro  { padding:10px 13px; border-radius:10px; border:1.5px solid var(--border); cursor:pointer; transition:all .18s; display:flex; align-items:center; gap:8px; }
        .ro:hover { border-color:var(--teal); background:var(--teal-p); }
        .ro.ch    { border-color:var(--teal); background:var(--teal-p); }
        .rc  { width:16px; height:16px; border-radius:50%; border:2px solid var(--teal); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rd  { width:8px; height:8px; border-radius:50%; background:var(--teal); }
        .ei  { width:100%; padding:10px 13px; border-radius:10px; border:1.5px solid var(--border); font-size:.85rem; font-family:'Plus Jakarta Sans',sans-serif; color:var(--ink); background:var(--white); transition:all .2s; }
        .ei:focus { outline:none; border-color:var(--teal); box-shadow:0 0 0 3px rgba(26,107,90,.08); }

        .res-pass { background:#e8f5e9; border:1.5px solid #81c784; border-radius:12px; padding:1.1rem; margin-bottom:1.2rem; }
        .res-fail { background:#fff3e0; border:1.5px solid #ffb74d; border-radius:12px; padding:1.1rem; margin-bottom:1.2rem; }
      `}</style>

      <div className="pw">

        {/* ── Header ─────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          <div>
            <h1 className="sf" style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--ink)", margin: "0 0 0.3rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Government Schemes for Women
            </h1>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-s)", margin: 0, fontWeight: 500 }}>
              {loading ? "Loading..." : `${stats.total} schemes available across all categories`}
            </p>
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--ink-m)", fontWeight: 500, whiteSpace: "nowrap", marginLeft: "1rem" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>

        {/* ── Stat chips ─────────────────────────── */}
        {!loading && (
          <div className="stat-row">
            <div className="stat-chip"><strong>{stats.total}</strong> Total Schemes</div>
            <div className="stat-chip"><strong>{schemes.length}</strong> Filtered Results</div>
            <div className="stat-chip"><strong>{remoteCount}</strong> All India</div>
          </div>
        )}

        {/* ── Search ─────────────────────────────── */}
        <div className="sw">
          <span className="si-icon"><IconSearch /></span>
          <input
            className="si"
            placeholder="Search by scheme name, benefit, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Life stage filter ───────────────────── */}
        <div className="fr" style={{ marginBottom: "1rem" }}>
          <span className="fl">Life Stage</span>
          {LIFE_STAGES.map((s) => (
            <button
              key={s.id}
              className={`fc ${lifeStage === s.id ? "on" : ""}`}
              onClick={() => setLifeStage(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Category filter ─────────────────────── */}
        <div className="fr" style={{ marginBottom: "2rem" }}>
          <span className="fl">Category</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`fc ${category === c ? "on" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
              {c !== "All Categories" && stats.byCategory[c]
                ? ` (${stats.byCategory[c]})`
                : ""}
            </button>
          ))}
        </div>

        {/* ── Main layout ─────────────────────────── */}
        <div className="ml">

          {/* List */}
          <div>
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div className="sk" style={{ width: 48, height: 48, borderRadius: 11 }} />
                    <div style={{ flex: 1 }}>
                      <div className="sk" style={{ height: 13, width: "55%", marginBottom: 8 }} />
                      <div className="sk" style={{ height: 17, width: "42%", marginBottom: 8 }} />
                      <div className="sk" style={{ height: 11, width: "80%" }} />
                    </div>
                  </div>
                </div>
              ))
            ) : schemes.length === 0 ? (
              <div style={{ background: "var(--white)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "3.5rem 2rem", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, background: "var(--bg2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .9rem" }}>
                  <IconSearch />
                </div>
                <p style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No schemes found</p>
                <p style={{ fontSize: ".83rem", color: "var(--ink-s)" }}>
                  Try a different life stage, category, or search term
                </p>
              </div>
            ) : (
              schemes.map((scheme, i) => {
                const cc   = CAT_COLORS[scheme.category] || { bg: "#f4f8f6", color: "#6b8c82", border: "#d0e6dc" };
                const hasQ = scheme.eligibilityQuestions?.length > 0;
                const isExp = expandedId === scheme._id;

                return (
                  <div
                    key={scheme._id}
                    className={`card ${isExp ? "exp" : ""}`}
                    style={{ animationDelay: `${i * 0.045}s` }}
                    onClick={() => setExpandedId(isExp ? null : scheme._id)}
                  >
                    {/* Card top */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".9rem" }}>
                      <div style={{ display: "flex", gap: ".85rem", alignItems: "flex-start", flex: 1 }}>
                        <div className="c-icon">{scheme.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div className="c-name">{scheme.name}</div>
                          <div className="c-val">{scheme.benefit}</div>
                          <p className="c-desc">{scheme.description}</p>
                          <div className="cmr">
                            <span className="mi"><IconPin /> {scheme.state}</span>
                            <span className="mi">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {scheme.status === "active" ? "Active" : "Inactive"}
                            </span>
                            {hasQ && (
                              <span className="mi" style={{ color: "var(--teal)", fontWeight: 600 }}>
                                {scheme.eligibilityQuestions.length} eligibility questions
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".5rem", marginLeft: ".8rem" }}>
                        <span className="badge" style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>
                          {scheme.category}
                        </span>
                        <IconChevron open={isExp} />
                      </div>
                    </div>

                    {/* Quick actions (always visible) */}
                    <div className="ar" onClick={(e) => e.stopPropagation()}>
                      {hasQ && (
                        <button className="bp" onClick={() => openElig(scheme)}>
                          Check Eligibility
                        </button>
                      )}
                      <button className="bo" onClick={() => { setDetailScheme(scheme); }}>
                        View Details
                      </button>
                      {scheme.website && scheme.website !== "Varies by state" && (
                        <button className="bg" onClick={() => window.open(scheme.website, "_blank")}>
                          Website
                        </button>
                      )}
                    </div>

                    {/* Expanded section */}
                    {isExp && (
                      <div className="cxb" onClick={(e) => e.stopPropagation()}>
                        <p className="cxdesc">{scheme.howToApply}</p>
                        {scheme.eligibility?.length > 0 && (
                          <div className="elig-items">
                            {scheme.eligibility.map((item, j) => (
                              <div key={j} className="elig-item">
                                <span className="elig-check">&#x2713;</span>
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                        {scheme.documents?.length > 0 && (
                          <div className="doc-chips">
                            {scheme.documents.map((d, j) => (
                              <span key={j} className="doc-chip">{d}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Sidebar ──────────────────────────── */}
          <aside className="psb">
            <div className="sbc">
              <div className="sbt">Overview</div>
              <div className="sbr"><span className="sbl">Total Schemes</span><span className="sbv">{stats.total}</span></div>
              <div className="sbr"><span className="sbl">Filtered Results</span><span className="sbv">{schemes.length}</span></div>
              <div className="sbr"><span className="sbl">All India</span><span className="sbv">{remoteCount}</span></div>
            </div>

            <div className="sbc">
              <div className="sbt">By Category</div>
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <div key={cat} className="sbr">
                  <span className="sbl">{cat}</span>
                  <span className="sbv">{count}</span>
                </div>
              ))}
            </div>

            <div className="tc">
              <div className="tct">How It Works</div>
              {[
                "Click 'Check Eligibility' to verify if you qualify.",
                "All schemes are from official government sources.",
                "Answer questions accurately for best results.",
                "Keep required documents ready before applying.",
              ].map((tip) => (
                <div key={tip} className="ti">
                  <span className="tb">&#x2022;</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Detail Modal ───────────────────────────── */}
      {detailScheme && !eligScheme && (
        <div className="ov" onClick={() => setDetailScheme(null)}>
          <div className="mb" onClick={(e) => e.stopPropagation()}>
            <div className="mh">
              <div style={{ display: "flex", gap: ".85rem", alignItems: "center", flex: 1 }}>
                <div style={{ fontSize: "2.4rem" }}>{detailScheme.icon}</div>
                <div>
                  <h2 className="sf" style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--ink)", margin: "0 0 5px" }}>
                    {detailScheme.name}
                  </h2>
                  <span className="badge" style={{
                    background: CAT_COLORS[detailScheme.category]?.bg,
                    color: CAT_COLORS[detailScheme.category]?.color,
                    border: `1px solid ${CAT_COLORS[detailScheme.category]?.border}`,
                  }}>
                    {detailScheme.category}
                  </span>
                </div>
              </div>
              <button className="xb" onClick={() => setDetailScheme(null)}>&#x00D7;</button>
            </div>
            <div className="mbdy">
              <div style={{ marginBottom: "1.4rem" }}>
                <div className="sl">Benefit</div>
                <div className="sf" style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--teal)" }}>{detailScheme.benefit}</div>
              </div>
              <div style={{ marginBottom: "1.4rem" }}>
                <div className="sl">About</div>
                <p style={{ fontSize: ".86rem", color: "var(--ink-m)", lineHeight: 1.7, margin: 0 }}>{detailScheme.description}</p>
              </div>
              <div style={{ marginBottom: "1.4rem" }}>
                <div className="sl">Eligibility Criteria</div>
                <div className="elig-items">
                  {detailScheme.eligibility?.map((item, i) => (
                    <div key={i} className="elig-item"><span className="elig-check">&#x2713;</span>{item}</div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "1.4rem" }}>
                <div className="sl">Documents Required</div>
                <div className="doc-chips">
                  {detailScheme.documents?.map((d, i) => <span key={i} className="doc-chip">{d}</span>)}
                </div>
              </div>
              <div style={{ marginBottom: "1.4rem" }}>
                <div className="sl">How to Apply</div>
                <div style={{ background: "var(--bg)", borderRadius: 10, padding: ".9rem", fontSize: ".84rem", color: "var(--ink-m)", lineHeight: 1.7 }}>
                  {detailScheme.howToApply}
                </div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="sl">Availability</div>
                <span style={{ fontSize: ".86rem", color: "var(--ink)", fontWeight: 600 }}>{detailScheme.state}</span>
              </div>
              <div className="ar">
                {detailScheme.eligibilityQuestions?.length > 0 && (
                  <button className="bp" onClick={() => { setDetailScheme(null); openElig(detailScheme); }}>Check Eligibility</button>
                )}
                {detailScheme.website && detailScheme.website !== "Varies by state" && (
                  <button className="bo" onClick={() => window.open(detailScheme.website, "_blank")}>Official Website</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Eligibility Checker Modal ───────────────── */}
      {eligScheme && !showResult && currentQ && (
        <div className="ov">
          <div className="mb" onClick={(e) => e.stopPropagation()}>
            <div className="mh">
              <div style={{ flex: 1 }}>
                <h3 className="sf" style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--ink)", margin: "0 0 3px" }}>
                  Eligibility Check
                </h3>
                <p style={{ fontSize: ".77rem", color: "var(--ink-s)", margin: 0 }}>{eligScheme.name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".5rem" }}>
                  <span style={{ fontSize: ".71rem", color: "var(--ink-s)", fontWeight: 600 }}>
                    Question {qIndex + 1} of {totalQs}
                  </span>
                  <span style={{ fontSize: ".71rem", color: "var(--teal)", fontWeight: 700 }}>
                    {Math.round(((qIndex + 1) / totalQs) * 100)}%
                  </span>
                </div>
                <div className="prb"><div className="prf" style={{ width: `${((qIndex + 1) / totalQs) * 100}%` }} /></div>
              </div>
              <button className="xb" onClick={closeElig}>&#x00D7;</button>
            </div>
            <div className="mbdy">
              <div className="sf" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", marginBottom: ".6rem", lineHeight: 1.4 }}>
                {currentQ.question}
                {currentQ.required && <span style={{ color: "#d32f2f", marginLeft: 3 }}>*</span>}
              </div>
              {currentQ.helpText && (
                <p style={{ fontSize: ".76rem", color: "var(--ink-s)", marginBottom: "1.1rem", lineHeight: 1.6, fontStyle: "italic" }}>
                  {currentQ.helpText}
                </p>
              )}
              <div style={{ marginBottom: "1.8rem" }}>
                {currentQ.type === "yes_no" && (
                  <div style={{ display: "flex", gap: ".9rem" }}>
                    {["yes", "no"].map((opt) => (
                      <div key={opt} className={`ro ${answers[currentQ.id] === opt ? "ch" : ""}`}
                           style={{ flex: 1 }} onClick={() => answer(currentQ.id, opt)}>
                        <div className="rc">{answers[currentQ.id] === opt && <div className="rd" />}</div>
                        <span style={{ fontSize: ".86rem", fontWeight: 600, textTransform: "capitalize" }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {["number", "age_range", "income_range"].includes(currentQ.type) && (
                  <input type="number" className="ei"
                    placeholder={currentQ.type === "age_range" ? "Enter your age" : currentQ.type === "income_range" ? "Enter annual income" : "Enter value"}
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => answer(currentQ.id, e.target.value)} />
                )}
                {currentQ.type === "select" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                    {currentQ.options.map((opt) => (
                      <div key={opt} className={`ro ${answers[currentQ.id] === opt ? "ch" : ""}`} onClick={() => answer(currentQ.id, opt)}>
                        <div className="rc">{answers[currentQ.id] === opt && <div className="rd" />}</div>
                        <span style={{ fontSize: ".84rem", fontWeight: 600 }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {currentQ.type === "text" && (
                  <input type="text" className="ei" placeholder="Enter your answer"
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => answer(currentQ.id, e.target.value)} />
                )}
              </div>
              <div style={{ display: "flex", gap: ".7rem", justifyContent: "space-between" }}>
                <button className="bo" onClick={() => setQIndex((p) => p - 1)}
                        disabled={qIndex === 0} style={{ opacity: qIndex === 0 ? 0.4 : 1 }}>
                  Previous
                </button>
                <button className="bp" onClick={nextQ}
                        disabled={!answers[currentQ.id]} style={{ opacity: !answers[currentQ.id] ? 0.45 : 1 }}>
                  {qIndex === totalQs - 1 ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Results Modal ──────────────────────────── */}
      {showResult && result && (
        <div className="ov">
          <div className="mb" onClick={(e) => e.stopPropagation()}>
            <div className="mbdy">
              <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
                <div className="sf" style={{ fontSize: "1.7rem", fontWeight: 900, margin: "0 0 .5rem", color: result.eligible ? "#2e7d32" : "#e65100" }}>
                  {result.eligible ? "You are Eligible" : "Not Fully Eligible"}
                </div>
                <p style={{ fontSize: ".86rem", color: "var(--ink-m)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto" }}>
                  {result.message}
                </p>
              </div>
              <div style={{ background: "var(--bg2)", borderRadius: 12, padding: "1.1rem", marginBottom: "1.4rem", textAlign: "center" }}>
                <div className="sl" style={{ marginBottom: ".5rem" }}>Eligibility Score</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                  <div className="sf" style={{ fontSize: "2.5rem", fontWeight: 900, color: result.eligible ? "#2e7d32" : "#e65100" }}>
                    {result.score}%
                  </div>
                  <div>
                    <div style={{ fontSize: ".74rem", color: "var(--ink-s)" }}>Required: {result.threshold}%</div>
                    <div style={{ fontSize: ".74rem", fontWeight: 700, color: result.eligible ? "#2e7d32" : "#e65100" }}>
                      {result.eligible ? "Above threshold" : "Below threshold"}
                    </div>
                  </div>
                </div>
              </div>
              {result.satisfiedCriteria?.length > 0 && (
                <div style={{ marginBottom: "1.2rem" }}>
                  <div className="sl">Criteria Met ({result.satisfiedCriteria.length})</div>
                  <div className="elig-items" style={{ background: "#e8f5e9", borderColor: "#a5d6a7" }}>
                    {result.satisfiedCriteria.map((item, i) => (
                      <div key={i} className="elig-item" style={{ color: "#2e7d32", borderColor: "#c8e6c9" }}>
                        <span className="elig-check">&#x2713;</span>{item.question}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.missingCriteria?.length > 0 && (
                <div style={{ marginBottom: "1.4rem" }}>
                  <div className="sl">Requirements Not Met ({result.missingCriteria.length})</div>
                  <div className="elig-items" style={{ background: "#fff3e0", borderColor: "#ffcc80" }}>
                    {result.missingCriteria.map((item, i) => (
                      <div key={i} className="elig-item" style={{ flexDirection: "column", gap: 2, color: "#e65100", borderColor: "#ffcc80" }}>
                        <span>{item.question}</span>
                        {item.helpText && <span style={{ fontSize: ".72rem", color: "var(--ink-s)", fontStyle: "italic" }}>{item.helpText}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="ar">
                {result.eligible ? (
                  <>
                    {eligScheme?.website && eligScheme.website !== "Varies by state" && (
                      <button className="bp" onClick={() => window.open(eligScheme.website, "_blank")}>Proceed to Apply</button>
                    )}
                    <button className="bg" onClick={closeElig}>Done</button>
                  </>
                ) : (
                  <>
                    <button className="bo" onClick={() => { setShowResult(false); setQIndex(0); setAnswers({}); }}>Retake</button>
                    <button className="bp" onClick={closeElig}>Close</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}