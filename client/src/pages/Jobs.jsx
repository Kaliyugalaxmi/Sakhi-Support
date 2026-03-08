import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

const JOB_TYPES = ["All", "Work from Home", "Part-time · Local", "Freelance", "Full-time · Office", "Contract"];

const TYPE_COLORS = {
  "Work from Home":     { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  "Part-time · Local":  { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  "Freelance":          { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
  "Full-time · Office": { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" },
  "Contract":           { bg: "#fce4ec", color: "#c2185b", border: "#f48fb1" },
};

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
const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCal = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg className={`chevron${open ? " open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default function Jobs() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch]       = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [byType, setByType]       = useState({});

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const p = new URLSearchParams({ status: "active" });
      if (search.trim()) p.append("search", search.trim());

      const res  = await fetch(`${API_BASE}/jobs?${p}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        const counts = {};
        data.data.forEach((j) => { counts[j.type] = (counts[j.type] || 0) + 1; });
        setByType(counts);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchJobs, 280);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = jobs.filter(
    (j) => typeFilter === "All" || j.type === typeFilter
  );

  const daysSince = (d) => {
    const diff = Math.ceil(Math.abs(new Date() - new Date(d)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff}d ago`;
  };

  const remoteCount = jobs.filter(
    (j) => j.type === "Work from Home" || j.type === "Freelance"
  ).length;

  return (
    <div style={{ background: "var(--bg)", fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        :root {
          --teal:#1a6b5a; --teal-d:#134f42; --teal-m:#22896f;
          --teal-l:#c8e6dc; --teal-p:#ebf6f2; --sand:#e8a96a;
          --ink:#0d1c18; --ink-m:#344e44; --ink-s:#6b8c82;
          --border:#d0e6dc; --white:#ffffff; --bg:#f4f8f6; --bg2:#edf5f1;
        }
        .sf { font-family:'Fraunces',serif; }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
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
        .fr { display:flex; gap:.38rem; flex-wrap:wrap; align-items:center; margin-bottom:2rem; }
        .fl { font-size:.71rem; font-weight:700; color:var(--ink-s); text-transform:uppercase; letter-spacing:.07em; margin-right:.3rem; white-space:nowrap; }
        .fc { padding:5px 13px; border-radius:100px; border:1.5px solid var(--border); background:var(--white); color:var(--ink-m); font-size:.75rem; font-weight:600; cursor:pointer; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; white-space:nowrap; }
        .fc:hover { border-color:var(--teal-l); background:var(--teal-p); color:var(--teal); }
        .fc.on    { background:var(--teal); color:#fff; border-color:var(--teal); }

        /* layout */
        .ml { display:grid; grid-template-columns:1fr 282px; gap:1.4rem; align-items:start; }
        @media(max-width:860px) { .ml{grid-template-columns:1fr} .psb{display:none} }

        /* card */
        .card {
          background:var(--white); border:1.5px solid var(--border); border-radius:14px;
          padding:1.3rem 1.4rem; margin-bottom:.85rem; cursor:pointer;
          animation:fadeUp .3s ease both; transition:all .2s; overflow:hidden;
        }
        .card:hover { box-shadow:0 6px 24px rgba(13,28,24,.09); transform:translateY(-2px); border-color:var(--teal-l); }
        .card.exp   { border-color:var(--teal); box-shadow:0 6px 24px rgba(26,107,90,.11); }

        .c-icon { width:46px; height:46px; border-radius:11px; background:var(--bg2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:1.45rem; flex-shrink:0; }
        .c-title { font-size:.98rem; font-weight:700; color:var(--ink); margin:0 0 3px; line-height:1.3; }
        .c-sub   { font-size:.79rem; color:var(--ink-s); margin:0; font-weight:500; }
        .c-val   { font-family:'Fraunces',serif; font-size:1.2rem; font-weight:900; color:var(--teal); display:block; line-height:1; margin-bottom:4px; }
        .badge   { padding:3px 10px; border-radius:100px; font-size:.67rem; font-weight:700; flex-shrink:0; }

        .cmr { display:flex; gap:.85rem; flex-wrap:wrap; margin-top:.8rem; }
        .mi  { display:flex; align-items:center; gap:4px; font-size:.75rem; color:var(--ink-s); font-weight:500; }

        .tag-row { display:flex; gap:.35rem; flex-wrap:wrap; margin-top:.65rem; }
        .tag     { background:var(--bg2); color:var(--ink-s); padding:2px 9px; border-radius:6px; font-size:.67rem; font-weight:600; border:1px solid var(--border); }

        /* expanded */
        .cxb  { padding:1.25rem 1.4rem; border-top:1.5px solid var(--border); background:var(--bg); animation:expandDown .2s ease; }
        .cxdesc { font-size:.83rem; color:var(--ink-m); line-height:1.7; margin-bottom:1.1rem; }

        .dg { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; margin-bottom:1.1rem; }
        @media(max-width:560px) { .dg{grid-template-columns:1fr} }
        .db { background:var(--white); border-radius:10px; border:1px solid var(--border); padding:.8rem .95rem; }
        .db.teal { background:var(--teal-p); border-color:var(--teal-l); }
        .dbl { font-size:.67rem; font-weight:700; color:var(--ink-s); text-transform:uppercase; letter-spacing:.07em; margin-bottom:.55rem; }
        .db.teal .dbl { color:var(--teal); }
        .dl  { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px; }
        .dl li { font-size:.79rem; color:var(--ink-m); display:flex; align-items:flex-start; gap:5px; line-height:1.5; }
        .dot { width:4px; height:4px; border-radius:50%; background:var(--ink-s); margin-top:7px; flex-shrink:0; }
        .chk { color:var(--teal); font-weight:700; flex-shrink:0; }

        /* actions */
        .ar  { display:flex; gap:.6rem; flex-wrap:wrap; }
        .bp  { background:var(--teal); color:#fff; border:none; padding:9px 18px; border-radius:9px; font-weight:700; font-size:.79rem; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .bp:hover { background:var(--teal-d); transform:translateY(-1px); }
        .bg  { background:transparent; color:var(--ink-m); border:1.5px solid var(--border); padding:9px 16px; border-radius:9px; font-weight:600; font-size:.79rem; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .bg:hover { background:var(--white); border-color:var(--teal-l); }

        .chevron      { transition:transform .2s; color:var(--ink-s); flex-shrink:0; }
        .chevron.open { transform:rotate(180deg); }

        /* skeleton */
        .sk { background:linear-gradient(90deg,#e8f0ec 25%,#d4e8de 50%,#e8f0ec 75%); background-size:200%; animation:shimmer 1.5s infinite; border-radius:6px; }

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
      `}</style>

      <div className="pw">

        {/* ── Header ─────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          <div>
            <h1 className="sf" style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--ink)", margin: "0 0 0.3rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Job Opportunities
            </h1>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-s)", margin: 0, fontWeight: 500 }}>
              {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "position" : "positions"} available`}
            </p>
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--ink-m)", fontWeight: 500, whiteSpace: "nowrap", marginLeft: "1rem" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>

        {/* ── Stat chips ─────────────────────────── */}
        {!loading && (
          <div className="stat-row">
            <div className="stat-chip"><strong>{jobs.length}</strong> Total Listings</div>
            <div className="stat-chip"><strong>{filtered.length}</strong> Filtered Results</div>
            <div className="stat-chip"><strong>{remoteCount}</strong> Remote / Freelance</div>
          </div>
        )}

        {/* ── Search ─────────────────────────────── */}
        <div className="sw">
          <span className="si-icon"><IconSearch /></span>
          <input
            className="si"
            placeholder="Search by title, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Type filter ─────────────────────────── */}
        <div className="fr">
          <span className="fl">Work Type</span>
          {JOB_TYPES.map((t) => (
            <button key={t} className={`fc ${typeFilter === t ? "on" : ""}`} onClick={() => setTypeFilter(t)}>
              {t}
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
                    <div className="sk" style={{ width: 46, height: 46, borderRadius: 11 }} />
                    <div style={{ flex: 1 }}>
                      <div className="sk" style={{ height: 13, width: "50%", marginBottom: 8 }} />
                      <div className="sk" style={{ height: 11, width: "33%", marginBottom: 12 }} />
                      <div className="sk" style={{ height: 10, width: "65%" }} />
                    </div>
                    <div><div className="sk" style={{ height: 18, width: 70, marginBottom: 6 }} /></div>
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ background: "var(--white)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "3.5rem 2rem", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, background: "var(--bg2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .9rem" }}>
                  <IconSearch />
                </div>
                <p style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No positions found</p>
                <p style={{ fontSize: ".83rem", color: "var(--ink-s)" }}>Try a different filter or search term</p>
              </div>
            ) : (
              filtered.map((job, i) => {
                const isExp = expandedId === job._id;
                const tc    = TYPE_COLORS[job.type] || { bg: "#f4f8f6", color: "#6b8c82", border: "#d0e6dc" };

                return (
                  <div
                    key={job._id}
                    className={`card ${isExp ? "exp" : ""}`}
                    style={{ animationDelay: `${i * 0.045}s` }}
                    onClick={() => setExpandedId(isExp ? null : job._id)}
                  >
                    {/* Card top */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: ".85rem" }}>
                      <div className="c-icon">{job.icon}</div>

                      <div style={{ flex: 1 }}>
                        <h3 className="c-title">{job.title}</h3>
                        <p className="c-sub">{job.company}</p>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span className="c-val">{job.pay}</span>
                        <span className="badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                          {job.type}
                        </span>
                      </div>

                      <IconChevron open={isExp} />
                    </div>

                    {/* Meta */}
                    <div className="cmr">
                      <span className="mi"><IconPin /> {job.location}</span>
                      <span className="mi"><IconClock /> {job.duration}</span>
                      <span className="mi"><IconCal /> {daysSince(job.postedDate)}</span>
                    </div>

                    {/* Tags */}
                    {job.tags?.length > 0 && (
                      <div className="tag-row">
                        {job.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                      </div>
                    )}

                    {/* Expanded */}
                    {isExp && (
                      <div className="cxb" onClick={(e) => e.stopPropagation()}>
                        <p className="cxdesc">{job.description}</p>
                        <div className="dg">
                          {job.requirements?.length > 0 && (
                            <div className="db">
                              <div className="dbl">Requirements</div>
                              <ul className="dl">
                                {job.requirements.map((r, j) => (
                                  <li key={j}><span className="dot" />{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {job.benefits?.length > 0 && (
                            <div className="db teal">
                              <div className="dbl">Benefits</div>
                              <ul className="dl">
                                {job.benefits.map((b, j) => (
                                  <li key={j}><span className="chk">&#x2713;</span>{b}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="ar">
                          <button className="bp">Apply Now</button>
                          <button className="bg">Save</button>
                          <button className="bg">Share</button>
                        </div>
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
              <div className="sbr"><span className="sbl">Total Listings</span><span className="sbv">{jobs.length}</span></div>
              <div className="sbr"><span className="sbl">Filtered Results</span><span className="sbv">{filtered.length}</span></div>
              <div className="sbr"><span className="sbl">Remote / Freelance</span><span className="sbv">{remoteCount}</span></div>
            </div>

            <div className="sbc">
              <div className="sbt">By Work Type</div>
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="sbr">
                  <span className="sbl">{type}</span>
                  <span className="sbv">{count}</span>
                </div>
              ))}
            </div>

            <div className="tc">
              <div className="tct">Application Tips</div>
              {[
                "Review requirements carefully before applying.",
                "Prepare a brief personal introduction.",
                "For remote roles, ensure a stable internet connection.",
                "Follow up after one week if no response.",
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
    </div>
  );
}