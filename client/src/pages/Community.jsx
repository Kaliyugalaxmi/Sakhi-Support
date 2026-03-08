import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api/community";
const BACKEND_URL = "http://localhost:5000"; // ✅ ADD THIS - for serving images

const CATEGORIES = ["All", "General", "Jobs", "Schemes", "Legal", "Health", "Support"];

const CATEGORY_COLORS = {
  General: { bg: "#ebf6f2", color: "#1a6b5a", border: "#c8e6dc" },
  Jobs:    { bg: "#eef1fb", color: "#4a60a0", border: "#c5cef0" },
  Schemes: { bg: "#fdf3e7", color: "#c47a28", border: "#f5d9aa" },
  Legal:   { bg: "#f3eefb", color: "#7a4aa0", border: "#d5c5f0" },
  Health:  { bg: "#fce8e8", color: "#b84030", border: "#f5c5c0" },
  Support: { bg: "#e8f3fb", color: "#287ac4", border: "#aad5f5" },
};

const CATEGORY_ICONS = {
  General: "💬", Jobs: "💼", Schemes: "🏛️",
  Legal: "⚖️", Health: "🏥", Support: "🤝",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ name, size = 36 }) {
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = [
    ["#1a6b5a","#22896f"], ["#4a60a0","#5a72c0"], ["#c47a28","#e8a96a"],
    ["#7a4aa0","#9a6ac0"], ["#b84030","#d86050"], ["#287ac4","#48a0e4"],
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.35,
      boxShadow: `0 2px 6px ${colors[idx][0]}44`,
    }}>
      {initials}
    </div>
  );
}

export default function Community({ userName = "Anonymous", token = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("General");
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const textareaRef = useRef(null);
  const feedRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Fetch posts ──
  const fetchPosts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(API, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch { /* backend down */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => fetchPosts(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Handle image selection ──
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Remove image ──
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Submit post ──
  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("content", text.trim());
      formData.append("category", category);
      formData.append("author", userName);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(API, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      
      if (res.ok) {
        setText("");
        removeImage();
        fetchPosts(true);
        setTimeout(() => feedRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
      } else {
        const d = await res.json();
        setError(d.message || "Failed to post");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setPosting(false);
    }
  };

  // ── Like / unlike ──
  const handleLike = async (postId) => {
    const alreadyLiked = likedPosts.includes(postId);
    const newLiked = alreadyLiked
      ? likedPosts.filter(id => id !== postId)
      : [...likedPosts, postId];
    setLikedPosts(newLiked);

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, likes: (p.likes || 0) + (alreadyLiked ? -1 : 1) }
        : p
    ));

    try {
      await fetch(`${API}/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: alreadyLiked ? "unlike" : "like" }),
      });
    } catch { /* silent */ }
  };

  // Auto-categorization: filter posts based on their category
  const filtered = activeFilter === "All"
    ? posts
    : posts.filter(p => p.category === activeFilter);

  const firstName = userName.split(" ")[0];

  // Calculate stats
  const totalLikes = posts.reduce((a, p) => a + (p.likes || 0), 0);
  const uniqueMembers = new Set(posts.map(p => p.author)).size;

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
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes heartBeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        .post-card {
          background: var(--white); border-radius: 16px; border: 1px solid var(--border);
          padding: 1.4rem; margin-bottom: 1rem;
          animation: fadeUp 0.4s ease both;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .post-card:hover { box-shadow: 0 6px 24px rgba(13,28,24,0.08); transform: translateY(-1px); }

        .filter-chip {
          padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(--border);
          background: var(--white); color: var(--ink-m); font-size: 0.8rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s ease;
          font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
        }
        .filter-chip:hover { border-color: var(--teal); color: var(--teal); background: var(--teal-p); }
        .filter-chip.active { background: var(--teal); color: #fff; border-color: var(--teal); }

        .cat-chip {
          padding: 5px 12px; border-radius: 100px; border: 1.5px solid var(--border);
          background: var(--white); color: var(--ink-m); font-size: 0.78rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cat-chip.selected { outline: 2px solid var(--teal); }

        .like-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(--border);
          background: transparent; cursor: pointer; font-size: 0.8rem;
          font-weight: 600; color: var(--ink-s); font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s ease;
        }
        .like-btn:hover { border-color: #e8547a; color: #e8547a; background: #fdf0f3; }
        .like-btn.liked { border-color: #e8547a; color: #e8547a; background: #fdf0f3; }
        .like-btn.liked .heart { animation: heartBeat 0.3s ease; }

        .reply-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(--border);
          background: transparent; cursor: pointer; font-size: 0.8rem;
          font-weight: 600; color: var(--ink-s); font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s ease;
        }
        .reply-btn:hover { border-color: var(--teal); color: var(--teal); background: var(--teal-p); }

        .post-btn {
          padding: 10px 22px; background: var(--teal); color: #fff;
          border: none; border-radius: 10px; font-weight: 700; font-size: 0.88rem;
          cursor: pointer; transition: all 0.2s ease; font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 8px rgba(26,107,90,0.2);
        }
        .post-btn:hover:not(:disabled) { background: var(--teal-d); box-shadow: 0 4px 14px rgba(26,107,90,0.25); transform: translateY(-1px); }
        .post-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .image-btn {
          padding: 8px 18px; background: var(--white); color: var(--teal);
          border: 1.5px solid var(--border); border-radius: 10px; font-weight: 600; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s ease; font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
        }
        .image-btn:hover { border-color: var(--teal); background: var(--teal-p); }

        .image-preview-container {
          position: relative; display: inline-block; margin-top: 12px;
          border-radius: 12px; overflow: hidden; border: 2px solid var(--border);
        }
        .image-preview-container img {
          max-width: 300px; max-height: 200px; display: block;
        }
        .remove-image-btn {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.7); color: white;
          border: none; border-radius: 50%; width: 28px; height: 28px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 18px; transition: all 0.2s ease;
        }
        .remove-image-btn:hover { background: rgba(0,0,0,0.9); transform: scale(1.1); }

        .post-image {
          margin: 12px 0; border-radius: 12px; overflow: hidden;
          border: 1px solid var(--border);
        }
        .post-image img {
          width: 100%; max-height: 500px; object-fit: cover; display: block;
        }

        textarea { resize: none; }
        textarea:focus { outline: none; border-color: var(--teal-m) !important; box-shadow: 0 0 0 3px rgba(26,107,90,0.1); }

        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

        .skeleton { background: linear-gradient(90deg, #e8f0ec 25%, #d4e8de 50%, #e8f0ec 75%); background-size: 200%; animation: pulse 1.5s infinite; border-radius: 8px; }

        .custom-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .custom-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-scroll {
          scrollbar-width: thin;
          scrollbar-color: #88c4b4 transparent;
        }
        .filter-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .filter-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .filter-scroll::-webkit-scrollbar-thumb {
          background: #88c4b4;
          border-radius: 3px;
        }

        @media (max-width: 1024px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .sidebar-sticky { position: relative !important; }
        }
      `}</style>

      <div className="custom-scroll" style={{ flex: 1, overflowY: "auto", padding: "2rem 2rem 3rem" }} ref={feedRef}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: "1.6rem" }}>
          <h2 className="sf" style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Community
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-s)", fontWeight: 500 }}>
            Share experiences, ask questions, and support each other
          </p>
        </div>

        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.4rem", alignItems: "start" }}>

          {/* ── LEFT: Composer + Feed ── */}
          <div>

            {/* Composer card */}
            <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.4rem", marginBottom: "1.4rem", boxShadow: "0 2px 12px rgba(13,28,24,0.04)" }}>
              <div style={{ display: "flex", gap: "0.9rem", marginBottom: "1rem" }}>
                <Avatar name={userName} size={40} />
                <div style={{ flex: 1 }}>
                  <textarea
                    ref={textareaRef}
                    rows={3}
                    placeholder={`What's on your mind, ${firstName}?`}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost(); }}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12,
                      border: "1.5px solid var(--border)", fontSize: "0.9rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--ink)",
                      background: "var(--bg)", lineHeight: 1.6, transition: "all 0.2s ease",
                    }}
                  />
                </div>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" />
                  <button className="remove-image-btn" onClick={removeImage}>×</button>
                </div>
              )}

              {/* Category selector */}
              <div style={{ marginBottom: "1rem", marginTop: imagePreview ? "1rem" : 0 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--ink-s)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  Category
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {Object.keys(CATEGORY_ICONS).map(cat => {
                    const c = CATEGORY_COLORS[cat];
                    return (
                      <button
                        key={cat}
                        className={`cat-chip ${category === cat ? "selected" : ""}`}
                        onClick={() => setCategory(cat)}
                        style={category === cat ? { background: c.bg, color: c.color, borderColor: c.border } : {}}
                      >
                        {CATEGORY_ICONS[cat]} {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{ background: "#fff0ee", border: "1px solid #f5c6cb", borderRadius: 8, padding: "8px 12px", marginBottom: "0.8rem", fontSize: "0.8rem", color: "#b84030", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    className="image-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📷 Add Image
                  </button>
                  <div style={{ fontSize: "0.75rem", color: "var(--ink-s)" }}>
                    {text.length > 0 && <span style={{ color: text.length > 500 ? "#b84030" : "var(--ink-s)" }}>{text.length}/500</span>}
                  </div>
                </div>
                <button
                  className="post-btn"
                  onClick={handlePost}
                  disabled={posting || !text.trim() || text.length > 500}
                >
                  {posting ? <div className="spinner" /> : "✦"}
                  {posting ? "Posting..." : "Share Post"}
                </button>
              </div>
            </div>

            {/* Filter chips */}
            <div className="filter-scroll" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem", overflowX: "auto", paddingBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${activeFilter === cat ? "active" : ""}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat !== "All" && CATEGORY_ICONS[cat] + " "}{cat}
                </button>
              ))}
            </div>

            {/* Feed */}
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.4rem" }}>
                    <div style={{ display: "flex", gap: "0.9rem", marginBottom: "1rem" }}>
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: "25%" }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: "70%" }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🌱</div>
                <div className="sf" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  {activeFilter === "All" ? "Be the first to post!" : `No ${activeFilter} posts yet`}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-s)" }}>
                  {activeFilter === "All" ? "Share something with the community above" : `Switch to "All" to see posts from other categories`}
                </div>
              </div>
            ) : (
              filtered.map((post, i) => {
                const isLiked = likedPosts.includes(post._id);
                const isOwn = post.author === userName;
                const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.General;
                return (
                  <div key={post._id || i} className="post-card" style={{ animationDelay: `${i * 0.04}s` }}>
                    {/* Post header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.9rem" }}>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <Avatar name={post.author} size={38} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)" }}>{post.author}</span>
                            {isOwn && (
                              <span style={{ background: "var(--teal-p)", color: "var(--teal)", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, border: "1px solid var(--teal-l)" }}>You</span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--ink-s)", marginTop: 1 }}>
                            {timeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <span style={{ background: catColor.bg, color: catColor.color, border: `1px solid ${catColor.border}`, padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", flexShrink: 0 }}>
                        {CATEGORY_ICONS[post.category]} {post.category}
                      </span>
                    </div>

                    {/* Content */}
                    <p style={{ fontSize: "0.92rem", color: "var(--ink-m)", lineHeight: 1.7, marginBottom: post.image ? "0.5rem" : "1.1rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {post.content}
                    </p>

                    {/* Post image - ✅ FIXED: Now uses full backend URL */}
                    {post.image && (
                      <div className="post-image">
                        <img src={`${BACKEND_URL}${post.image}`} alt="Post content" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.6rem", paddingTop: "0.8rem", borderTop: "1px solid var(--bg2)" }}>
                      <button className={`like-btn ${isLiked ? "liked" : ""}`} onClick={() => handleLike(post._id)}>
                        <span className="heart">{isLiked ? "❤️" : "🤍"}</span> {post.likes || 0}
                      </button>
                      <button className="reply-btn">
                        💬 {post.replies?.length || 0} {post.replies?.length === 1 ? "Reply" : "Replies"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="sidebar-sticky" style={{ position: "sticky", top: 0 }}>

            {/* Community stats */}
            <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.4rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "1rem" }}>Community Stats</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {[
                  { icon: "👥", label: "Members", val: uniqueMembers || "—" },
                  { icon: "📝", label: "Total Posts", val: posts.length || "—" },
                  { icon: "❤️", label: "Total Likes", val: totalLikes || "—" },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1rem" }}>{icon}</span>
                      <span style={{ fontSize: "0.83rem", color: "var(--ink-s)", fontWeight: 500 }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--teal)" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active members */}
            {posts.length > 0 && (
              <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.4rem", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "1rem" }}>Active Members</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[...new Set(posts.map(p => p.author))].slice(0, 5).map(author => (
                    <div key={author} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Avatar name={author} size={30} />
                      <div>
                        <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--ink)" }}>{author}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--ink-s)" }}>
                          {posts.filter(p => p.author === author).length} post{posts.filter(p => p.author === author).length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-m))", borderRadius: 16, padding: "1.4rem", color: "#fff" }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.9rem" }}>Community Guidelines</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  "Be kind and supportive",
                  "Respect everyone's privacy",
                  "Share accurate information",
                  "No spam or self-promotion",
                ].map(g => (
                  <div key={g} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#e8a96a", fontSize: "0.8rem", marginTop: 2 }}>✦</span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.9, lineHeight: 1.5 }}>{g}</span>
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