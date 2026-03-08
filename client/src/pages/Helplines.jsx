import { useState } from "react";

const HELPLINES = [
  // Emergency & Safety
  {
    category: "Emergency",
    icon: "🚨",
    name: "Emergency Services",
    number: "112",
    description: "All emergencies - Police, Fire, Ambulance",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  {
    category: "Emergency",
    icon: "📞",
    name: "Women Helpline",
    number: "181",
    description: "24-hour national helpline for women in distress",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  {
    category: "Emergency",
    icon: "🆘",
    name: "Police Women Helpline",
    number: "1091",
    description: "Immediate police assistance for women",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  
  // Domestic Violence & Abuse
  {
    category: "Domestic Violence",
    icon: "🏠",
    name: "Domestic Violence Helpline",
    number: "181",
    description: "Support for domestic violence victims",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  {
    category: "Domestic Violence",
    icon: "👤",
    name: "National Commission for Women",
    number: "7827-170-170",
    description: "Report grievances and seek assistance",
    availability: "Mon-Fri, 10 AM - 6 PM",
    free: true,
    whatsapp: true,
  },
  
  // Legal Aid
  {
    category: "Legal",
    icon: "⚖️",
    name: "Legal Services Authority",
    number: "15100",
    description: "Free legal aid and guidance",
    availability: "Mon-Sat, 10 AM - 5 PM",
    free: true,
    whatsapp: false,
  },
  {
    category: "Legal",
    icon: "📋",
    name: "Lawyer Helpline",
    number: "155260",
    description: "Legal consultation and support",
    availability: "Mon-Fri, 9 AM - 6 PM",
    free: false,
    whatsapp: false,
  },
  
  // Mental Health
  {
    category: "Mental Health",
    icon: "🧠",
    name: "Mental Health Helpline",
    number: "9152-987-821",
    description: "Counseling and mental health support",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  {
    category: "Mental Health",
    icon: "💭",
    name: "Vandrevala Foundation",
    number: "9999-666-555",
    description: "24/7 mental health support and crisis intervention",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  
  // Medical & Health
  {
    category: "Medical",
    icon: "🏥",
    name: "Medical Helpline",
    number: "104",
    description: "Medical advice and ambulance services",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  {
    category: "Medical",
    icon: "🤰",
    name: "Maternity Helpline",
    number: "1800-180-1104",
    description: "Pregnancy and maternal health support",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  
  // Child Safety
  {
    category: "Child Safety",
    icon: "👶",
    name: "Childline India",
    number: "1098",
    description: "Emergency helpline for children in need",
    availability: "24×7",
    free: true,
    whatsapp: false,
  },
  
  // Financial Support
  {
    category: "Financial",
    icon: "💰",
    name: "Banking Ombudsman",
    number: "155-255",
    description: "Banking complaints and grievances",
    availability: "Mon-Fri, 10 AM - 5 PM",
    free: true,
    whatsapp: false,
  },
];

const CATEGORIES = ["All", "Emergency", "Domestic Violence", "Legal", "Mental Health", "Medical", "Child Safety", "Financial"];

const CATEGORY_COLORS = {
  Emergency: { bg: "#fff0f0", color: "#d63031", border: "#fab1a0" },
  "Domestic Violence": { bg: "#fff3e0", color: "#e17055", border: "#ffeaa7" },
  Legal: { bg: "#f3e5f5", color: "#6c5ce7", border: "#a29bfe" },
  "Mental Health": { bg: "#e8f5e9", color: "#00b894", border: "#81ecec" },
  Medical: { bg: "#e3f2fd", color: "#0984e3", border: "#74b9ff" },
  "Child Safety": { bg: "#fff9c4", color: "#fdcb6e", border: "#ffeaa7" },
  Financial: { bg: "#f1f3f4", color: "#2d3436", border: "#dfe6e9" },
};

export default function Helplines() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHelplines = HELPLINES.filter(helpline => {
    const matchesCategory = activeCategory === "All" || helpline.category === activeCategory;
    const matchesSearch = helpline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          helpline.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          helpline.number.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleCall = (number) => {
    window.location.href = `tel:${number.replace(/[^0-9]/g, '')}`;
  };

  const handleWhatsApp = (number) => {
    window.open(`https://wa.me/91${number.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const groupedByCategory = CATEGORIES.slice(1).reduce((acc, category) => {
    acc[category] = HELPLINES.filter(h => h.category === category);
    return acc;
  }, {});

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        :root {
          --teal: #1a6b5a; --teal-d: #134f42; --teal-m: #22896f;
          --teal-l: #c8e6dc; --teal-p: #ebf6f2;
          --ink: #0d1c18; --ink-m: #344e44; --ink-s: #6b8c82;
          --border: #d0e6dc; --white: #ffffff; --bg: #f4f8f6; --bg2: #edf5f1;
        }
        .sf { font-family: 'Fraunces', serif; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        
        .helpline-card {
          background: var(--white); border-radius: 14px; border: 1px solid var(--border);
          padding: 1.4rem; margin-bottom: 1rem;
          animation: fadeUp 0.4s ease both;
          transition: all 0.2s;
        }
        .helpline-card:hover { box-shadow: 0 6px 24px rgba(13,28,24,0.08); transform: translateY(-2px); }

        .call-btn {
          padding: 10px 20px; background: var(--teal); color: #fff;
          border: none; border-radius: 10px; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 2px 8px rgba(26,107,90,0.2);
        }
        .call-btn:hover { background: var(--teal-d); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,107,90,0.3); }

        .whatsapp-btn {
          padding: 10px 20px; background: #25D366; color: #fff;
          border: none; border-radius: 10px; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 2px 8px rgba(37,211,102,0.2);
        }
        .whatsapp-btn:hover { background: #128C7E; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,211,102,0.3); }

        .filter-chip {
          padding: 8px 16px; border-radius: 100px; border: 1.5px solid var(--border);
          background: var(--white); color: var(--ink-m); font-size: 0.8rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s ease;
          font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
        }
        .filter-chip:hover { border-color: var(--teal); color: var(--teal); background: var(--teal-p); }
        .filter-chip.active { background: var(--teal); color: #fff; border-color: var(--teal); }

        .search-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid var(--border); font-size: 0.9rem;
          font-family: 'Plus Jakarta Sans', sans-serif; color: var(--ink);
          background: var(--white); transition: all 0.2s ease;
        }
        .search-input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(26,107,90,0.1); }

        .emergency-banner {
          background: linear-gradient(135deg, #d63031, #e17055);
          border-radius: 16px; padding: 1.8rem 2rem; color: #fff;
          margin-bottom: 1.5rem; box-shadow: 0 4px 16px rgba(214,48,49,0.2);
        }

        .quick-action {
          background: var(--white); border-radius: 12px; border: 2px solid var(--border);
          padding: 1.2rem; text-align: center; cursor: pointer;
          transition: all 0.2s;
        }
        .quick-action:hover { border-color: var(--teal); background: var(--teal-p); transform: translateY(-2px); }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: "2rem 2rem 3rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          <div>
            <h2 className="sf" style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Emergency Helplines
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-s)", fontWeight: 500, margin: 0 }}>
              24/7 support services for women in need - all calls are confidential
            </p>
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--ink-m)", fontWeight: 500, whiteSpace: "nowrap", marginLeft: "1rem" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>
        
        {/* Emergency Banner */}
        <div className="emergency-banner">
          <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🚨</div>
          <div className="sf" style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            In Immediate Danger?
          </div>
          <p style={{ fontSize: "0.9rem", opacity: 0.95, marginBottom: "1rem" }}>
            Call emergency services right away. Your safety is the priority.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="call-btn" onClick={() => handleCall("112")} style={{ background: "#fff", color: "#d63031", flex: 1, minWidth: "150px" }}>
              📞 Call 112 (Emergency)
            </button>
            <button className="call-btn" onClick={() => handleCall("181")} style={{ background: "#fff", color: "#d63031", flex: 1, minWidth: "150px" }}>
              📞 Call 181 (Women's Helpline)
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "1.2rem" }}>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search helplines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.4rem", alignItems: "start" }}>
          
          {/* Helplines List */}
          <div>
            {filteredHelplines.length === 0 ? (
              <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
                <div className="sf" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  No helplines found
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-s)" }}>
                  Try a different search term or category
                </p>
              </div>
            ) : (
              filteredHelplines.map((helpline, i) => {
                const catColor = CATEGORY_COLORS[helpline.category];
                return (
                  <div key={i} className="helpline-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{helpline.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                              {helpline.name}
                            </h3>
                            {helpline.free && (
                              <span style={{ background: "#d4edda", color: "#155724", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, border: "1px solid #c3e6cb" }}>
                                FREE
                              </span>
                            )}
                          </div>
                          <div className="sf" style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--teal)", lineHeight: 1, marginBottom: "0.5rem" }}>
                            {helpline.number}
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--ink-s)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                            {helpline.description}
                          </p>
                          <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--ink-s)" }}>
                            <span>⏰ {helpline.availability}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ 
                        background: catColor.bg, 
                        color: catColor.color, 
                        border: `1px solid ${catColor.border}`,
                        padding: "4px 12px", 
                        borderRadius: 100, 
                        fontSize: "0.7rem", 
                        fontWeight: 700,
                        flexShrink: 0,
                        marginLeft: "1rem"
                      }}>
                        {helpline.category}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button className="call-btn" onClick={() => handleCall(helpline.number)} style={{ flex: 1 }}>
                        📞 Call Now
                      </button>
                      {helpline.whatsapp && (
                        <button className="whatsapp-btn" onClick={() => handleWhatsApp(helpline.number)} style={{ flex: 1 }}>
                          💬 WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 0 }}>
            
            {/* Quick Actions */}
            <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.4rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "1rem" }}>Quick Actions</div>
              <div style={{ display: "grid", gap: "0.8rem" }}>
                <div className="quick-action" onClick={() => handleCall("112")}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>🚨</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)" }}>Emergency</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--ink-s)" }}>Call 112</div>
                </div>
                <div className="quick-action" onClick={() => handleCall("181")}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>📞</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)" }}>Women's Helpline</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--ink-s)" }}>Call 181</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.4rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "1rem" }}>Available Services</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {Object.entries(groupedByCategory).map(([category, helplines]) => (
                  <div key={category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-s)" }}>{category}</span>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--teal)" }}>{helplines.length}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Tips */}
            <div style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-m))", borderRadius: 16, padding: "1.4rem", color: "#fff" }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.9rem" }}>Safety Tips</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  "Save emergency numbers in your phone",
                  "Share your location with trusted contacts",
                  "All helpline calls are confidential",
                  "You have the right to seek help",
                ].map(tip => (
                  <div key={tip} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#e8a96a", fontSize: "0.8rem", marginTop: 2 }}>✦</span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.9, lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}