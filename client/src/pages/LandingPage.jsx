import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "🏛️", title: "Government Schemes", desc: "120+ welfare programmes — widow pension, maternity benefits, scholarships and more — matched to your eligibility automatically." },
  { icon: "💼", title: "Job Opportunities",   desc: "Work-from-home roles, part-time local jobs, and freelance gigs curated for women managing households." },
  { icon: "🤝", title: "Community Support",   desc: "A safe space to ask questions, share experiences, and receive guidance from women walking the same path." },
  { icon: "📞", title: "Helplines & NGOs",    desc: "Instant access to the National Commission for Women, legal aid, shelters, and support organisations near you." },
];

const WHY = [
  { q: "Who is this for?",              a: "Single mothers and widows in India who need help finding government welfare programmes, employment, or a supportive community — all in one place." },
  { q: "Is it really free?",            a: "Yes, 100%. Sakhi Support will always be free. We are funded by NGO partnerships and government grants — never by the women we serve." },
  { q: "Is my data safe?",              a: "Your personal information is encrypted and never shared with third parties. You are in full control of your profile at all times." },
  { q: "What languages are supported?", a: "The platform is available in both Hindi and English, with more regional languages coming soon." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq,    setOpenFaq]    = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const NAV = [
    { label: "About",         id: "about"   },
    { label: "What We Offer", id: "offer"   },
    { label: "Why Us",        id: "why"     },
    { label: "Help",          id: "contact" },
  ];

  /* shared section style — full viewport, flex-centered */
  const sec = (bg) => ({
    width: "100%",
    minHeight: "100vh",
    background: bg,
    display: "flex",
    alignItems: "center",
    padding: "80px clamp(1.5rem, 6vw, 4rem)",   /* 80px top clears the fixed nav */
  });

  const inner = { maxWidth: 1140, width: "100%", margin: "0 auto" };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0d1c18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          width: 100%; height: 100%;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        :root {
          --teal:   #1a6b5a;
          --teal-d: #134f42;
          --teal-m: #22896f;
          --teal-l: #c8e6dc;
          --teal-p: #ebf6f2;
          --sand:   #e8a96a;
          --ink:    #0d1c18;
          --ink-m:  #344e44;
          --ink-s:  #6b8c82;
          --border: #d0e6dc;
          --white:  #ffffff;
          --bg:     #f4f8f6;
          --bg2:    #edf5f1;
        }

        .sf { font-family: 'Fraunces', serif; }

        .btn {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 8px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600; font-size: 0.9rem;
          letter-spacing: 0.01em; transition: all 0.2s ease;
          padding: 0.75rem 1.8rem;
        }
        .btn-t { background: var(--teal); color: #fff; box-shadow: 0 2px 12px rgba(26,107,90,0.25); }
        .btn-t:hover { background: var(--teal-d); transform: translateY(-1px); }
        .btn-o { background: transparent; color: var(--teal); border: 1.5px solid var(--teal); }
        .btn-o:hover { background: var(--teal-p); }

        .nl {
          font-size: 0.875rem; font-weight: 500; color: var(--ink-m);
          cursor: pointer; background: none; border: none;
          padding: 0.4rem 0.9rem; border-radius: 6px; transition: all 0.2s;
        }
        .nl:hover { color: var(--teal); background: var(--teal-p); }

        .chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--teal-p); color: var(--teal);
          border: 1px solid var(--teal-l); border-radius: 100px;
          padding: 4px 14px; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
        }

        .bar { width: 36px; height: 4px; border-radius: 2px; background: var(--sand); }

        .fcard {
          background: var(--white); border-radius: 14px;
          border: 1px solid var(--border); padding: 1.8rem;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          display: flex; flex-direction: column;
        }
        .fcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(13,28,24,0.09);
          border-color: var(--teal-l);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp .65s 0s   both; }
        .a2 { animation: fadeUp .65s .1s  both; }
        .a3 { animation: fadeUp .65s .2s  both; }
        .a4 { animation: fadeUp .65s .3s  both; }
        .a5 { animation: fadeUp .65s .4s  both; }
        .a6 { animation: fadeUp .65s .5s  both; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: var(--teal-p); }
        ::-webkit-scrollbar-thumb { background: #88c4b4; border-radius: 3px; }

        /* Two-column split */
        .split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
          width: 100%;
        }

        /* Features grid */
        .feat-g {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2rem;
        }

        /* Help grid */
        .help-g {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.2rem;
        }

        @media (max-width: 1024px) {
          .feat-g { grid-template-columns: repeat(2, 1fr) !important; }
          .help-g { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .split   { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .hide-m  { display: none !important; }
          .show-m  { display: flex !important; }
        }
        @media (max-width: 600px) {
          .feat-g { grid-template-columns: 1fr !important; }
          .help-g { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─────────────── NAVBAR ─────────────── */}
      <nav style={{
        position: "fixed", inset: "0 0 auto 0", zIndex: 300, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1.5rem, 4vw, 4rem)",
        background: "rgba(235,246,242,0.98)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        transition: "all 0.3s",
      }}>
        <button onClick={() => scrollTo("hero")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--teal)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" }}>🌿</div>
          <span className="sf" style={{ fontSize:"1.2rem", fontWeight:700, color:"var(--ink)", letterSpacing:"-0.02em" }}>
            Sakhi <span style={{ color:"var(--teal)" }}>Support</span>
          </span>
        </button>

        <div className="hide-m" style={{ display:"flex", gap:"0.2rem" }}>
          {NAV.map(({ label, id }) => (
            <button key={id} className="nl" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>



        <button className="show-m" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display:"none", background:"none", border:"none", fontSize:"1.5rem", cursor:"pointer", color:"var(--ink)" }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:299, background:"var(--teal-p)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"2rem" }}>
          {NAV.map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} className="sf"
              style={{ fontSize:"2rem", fontWeight:700, background:"none", border:"none", cursor:"pointer", color:"var(--ink)" }}>
              {label}
            </button>
          ))}
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
            <button className="btn btn-o" onClick={() => { navigate("/login");    setMobileOpen(false); }}>Log In</button>
            <button className="btn btn-t" onClick={() => { navigate("/register"); setMobileOpen(false); }}>Join Free</button>
          </div>
        </div>
      )}

      {/* ─────────────── HERO ─────────────── */}
      {/* ─────────────── HERO ─────────────── */}
<section
  id="hero"
  style={{
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(180deg,#ebf6f2 0%,#f4f8f6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 clamp(1.5rem,6vw,4rem)",
    position: "relative",
    overflow: "hidden"
  }}
>

{/* soft background glow */}
<div
  style={{
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "rgba(26,107,90,0.12)",
    filter: "blur(120px)",
    borderRadius: "50%",
    top: "-120px",
    right: "-120px"
  }}
/>

<div
  style={{
    maxWidth: "900px",
    textAlign: "center",
    zIndex: 2
  }}
>

{/* badge */}
<div
  style={{
    display: "inline-block",
    padding: "6px 18px",
    background: "#ebf6f2",
    border: "1px solid #c8e6dc",
    borderRadius: "100px",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#1a6b5a",
    letterSpacing: "0.08em",
    marginBottom: "30px"
  }}
>
🌿 FOR SINGLE MOTHERS & WIDOWS
</div>


{/* heading */}
<h1
  style={{
    fontFamily: "Fraunces, serif",
    fontSize: "clamp(3rem,6vw,5rem)",
    lineHeight: "1.05",
    fontWeight: "900",
    color: "#0d1c18",
    marginBottom: "25px",
    letterSpacing: "-0.03em"
  }}
>
Support that helps you  
<br />
<span style={{ color: "#1a6b5a" }}>start again with confidence.</span>
</h1>


{/* subtitle */}
<p
  style={{
    maxWidth: "640px",
    margin: "0 auto",
    fontSize: "1.05rem",
    lineHeight: "1.9",
    color: "#344e44",
    marginBottom: "40px"
  }}
>
Sakhi Support connects women to  
<strong> government schemes</strong>,  
<strong> job opportunities</strong>, and a  
<strong> trusted community</strong> —  
so no woman rebuilding her life has to do it alone.
</p>


{/* CTA buttons */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap"
  }}
>

<button
  onClick={() => navigate("/register")}
  style={{
    background: "#1a6b5a",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: "10px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    boxShadow: "0 8px 25px rgba(26,107,90,0.3)"
  }}
>
Create Free Account →
</button>

<button
  onClick={() => navigate("/login")}
  style={{
    background: "transparent",
    border: "1.5px solid #1a6b5a",
    color: "#1a6b5a",
    padding: "14px 30px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.95rem"
  }}
>
Log In
</button>

</div>

</div>
</section>
      <style>{`@keyframes sdot{0%{transform:translateY(0);opacity:1;}80%{transform:translateY(10px);opacity:0;}100%{transform:translateY(0);opacity:0;}}`}</style>

      {/* ─────────────── ABOUT ─────────────── */}
      <section id="about" style={sec("var(--white)")}>
        <div style={inner}>
          <div className="split">
            <div>
              <div className="chip" style={{ marginBottom:"1rem" }}>Who We Are</div>
              <div className="bar" style={{ margin:"1rem 0 1.6rem" }} />
              <h2 className="sf" style={{ fontSize:"clamp(1.9rem,3.2vw,2.7rem)", fontWeight:700, color:"var(--ink)", lineHeight:1.2, marginBottom:"1.2rem" }}>
                Built for women who are{" "}
                <em style={{ color:"var(--teal)" }}>starting over with courage.</em>
              </h2>
              <p style={{ fontSize:"1rem", color:"var(--ink-m)", lineHeight:1.9, marginBottom:"1rem" }}>
                Millions of single mothers and widows across India don't know what support exists for them.
                Government portals are confusing, job boards are overwhelming, and finding community feels impossible.
              </p>
              <p style={{ fontSize:"1rem", color:"var(--ink-m)", lineHeight:1.9, marginBottom:"2rem" }}>
                <strong style={{ color:"var(--teal)" }}>Sakhi Support</strong> solves this — one simple,
                free, Hindi-friendly platform where no woman has to figure it out alone.
              </p>
              <button className="btn btn-t" onClick={() => scrollTo("offer")}>
                See What We Offer →
              </button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {[
                { icon:"🎯", head:"Our Mission",    body:"To ensure every woman in India, regardless of income or education, can access the welfare and employment support she is entitled to." },
                { icon:"🔒", head:"Safe & Private", body:"Your data is encrypted and never sold. You decide what to share, and you can delete your account at any time." },
                { icon:"🌐", head:"Hindi & English",body:"Available in Hindi and English with more regional languages on the way — so language is never a barrier." },
              ].map(({ icon, head, body }) => (
                <div key={head} style={{ display:"flex", gap:"1rem", alignItems:"flex-start", background:"var(--teal-p)", borderRadius:14, padding:"1.3rem 1.5rem", border:"1px solid var(--teal-l)" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"var(--white)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0, border:"1px solid var(--teal-l)" }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.94rem", color:"var(--ink)", marginBottom:"0.25rem" }}>{head}</div>
                    <div style={{ fontSize:"0.84rem", color:"var(--ink-m)", lineHeight:1.75 }}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── WHAT WE OFFER ─────────────── */}
      <section id="offer" style={sec("var(--bg)")}>
        <div style={inner}>
          <div style={{ marginBottom:"2.8rem" }}>
            <div className="chip" style={{ marginBottom:"1rem" }}>What We Offer</div>
            <div className="bar" style={{ margin:"1rem 0 1.4rem" }} />
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
              <h2 className="sf" style={{ fontSize:"clamp(1.9rem,3.2vw,2.7rem)", fontWeight:700, color:"var(--ink)", lineHeight:1.2 }}>
                Four features built around{" "}
                <em style={{ color:"var(--teal)" }}>your real needs</em>
              </h2>
              <p style={{ color:"var(--ink-m)", fontSize:"0.95rem", maxWidth:380, lineHeight:1.8 }}>
                Every module was shaped by listening to single mothers and widows about the challenges they actually face.
              </p>
            </div>
          </div>

          <div className="feat-g">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="fcard">
                <div style={{ width:50, height:50, borderRadius:13, background:"var(--teal-p)", border:"1px solid var(--teal-l)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", marginBottom:"1.2rem" }}>
                  {icon}
                </div>
                <h3 className="sf" style={{ fontSize:"1.05rem", fontWeight:700, color:"var(--ink)", marginBottom:"0.55rem" }}>{title}</h3>
                <p style={{ fontSize:"0.84rem", color:"var(--ink-m)", lineHeight:1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── WHY US ─────────────── */}
      <section id="why" style={sec("var(--white)")}>
        <div style={inner}>
          <div className="split">
            <div>
              <div className="chip" style={{ marginBottom:"1rem" }}>Why Sakhi Support</div>
              <div className="bar" style={{ margin:"1rem 0 1.5rem" }} />
              <h2 className="sf" style={{ fontSize:"clamp(1.9rem,3.2vw,2.7rem)", fontWeight:700, color:"var(--ink)", lineHeight:1.2, marginBottom:"1.1rem" }}>
                Common questions,{" "}
                <em style={{ color:"var(--teal)" }}>honest answers.</em>
              </h2>
              <p style={{ fontSize:"1rem", color:"var(--ink-m)", lineHeight:1.9, marginBottom:"2rem" }}>
                We believe you deserve clarity, not confusion. Here are the questions women ask us most.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
                {[
                  { icon:"🏅", t:"Backed by National Women's NGO Consortium" },
                  { icon:"🔒", t:"256-bit encrypted & fully private" },
                  { icon:"🆓", t:"Free forever — no hidden charges" },
                ].map(({ icon, t }) => (
                  <div key={t} style={{ display:"flex", alignItems:"center", gap:"0.7rem", fontSize:"0.87rem", color:"var(--ink-m)", fontWeight:500 }}>
                    <span style={{ fontSize:"1.1rem" }}>{icon}</span> {t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {WHY.map(({ q, a }, i) => (
                <div key={q} style={{
                  background:"var(--bg)",
                  border:`1.5px solid ${openFaq===i ? "var(--teal-m)" : "var(--border)"}`,
                  borderRadius:14, overflow:"hidden", transition:"border-color 0.2s",
                }}>
                  <button onClick={() => setOpenFaq(openFaq===i ? null : i)} style={{
                    width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"1.2rem 1.5rem", background:"none", border:"none", cursor:"pointer",
                    fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:"0.94rem",
                    color:"var(--ink)", textAlign:"left", gap:"1rem",
                  }}>
                    {q}
                    <span style={{
                      flexShrink:0, width:26, height:26, borderRadius:"50%",
                      background:openFaq===i ? "var(--teal)" : "var(--teal-l)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:openFaq===i ? "#fff" : "var(--teal)", fontSize:"1.1rem", transition:"all 0.2s",
                    }}>
                      {openFaq===i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq===i && (
                    <div style={{ padding:"0 1.5rem 1.2rem", fontSize:"0.87rem", color:"var(--ink-m)", lineHeight:1.85 }}>{a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── HELP ─────────────── */}
      <section id="contact" style={sec("var(--bg2)")}>
        <div style={inner}>
          <div style={{ marginBottom:"2.8rem" }}>
            <div className="chip" style={{ marginBottom:"1rem" }}>Help &amp; Support</div>
            <div className="bar" style={{ margin:"1rem 0 1.4rem" }} />
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
              <h2 className="sf" style={{ fontSize:"clamp(1.9rem,3.2vw,2.7rem)", fontWeight:700, color:"var(--ink)", lineHeight:1.2 }}>
                You are never{" "}
                <em style={{ color:"var(--teal)" }}>on your own.</em>
              </h2>
              <p style={{ color:"var(--ink-m)", fontSize:"0.95rem", maxWidth:380, lineHeight:1.8 }}>
                These helplines are free, confidential, and available to every woman in India — 24 hours a day.
              </p>
            </div>
          </div>

          <div className="help-g">
            {[
              { icon:"📞", num:"181",   head:"National Women Helpline",    sub:"Free call · 24×7 · All India",       col:"var(--teal)" },
              { icon:"🆘", num:"1091",  head:"Women in Distress Helpline", sub:"Police assistance · Immediate help", col:"#b84030"     },
              { icon:"⚖️", num:"15100", head:"Legal Aid Helpline",         sub:"Free legal guidance for women",      col:"#4a60a0"     },
            ].map(({ icon, num, head, sub, col }) => (
              <div key={head} style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:16, padding:"2.5rem 2rem", display:"flex", flexDirection:"column", gap:"0.6rem", transition:"transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 14px 40px rgba(13,28,24,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none";             e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ fontSize:"2rem" }}>{icon}</div>
                <div className="sf" style={{ fontSize:"2.8rem", fontWeight:900, color:col, letterSpacing:"0.03em", lineHeight:1 }}>{num}</div>
                <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--ink)" }}>{head}</div>
                <div style={{ fontSize:"0.82rem", color:"var(--ink-s)", lineHeight:1.6 }}>{sub}</div>
              </div>
            ))}
          </div>


        </div>
      </section>

    </div>
  );
}