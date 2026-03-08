import { useState, useEffect } from "react";

export default function Profile({ 
  userName, 
  token,
  email = "",
  phone = "",
  state = "",
  city = "",
  registrationData = {}
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: userName || registrationData.name || "User",
    email: (email && email.trim()) ? email : (registrationData.email || "user@example.com"),
    phone: (phone && phone.trim()) ? phone : (registrationData.phone || "+91 98765 43210"),
    age: registrationData.age || "",
    location: (city && city.trim() && state && state.trim()) ? `${city}, ${state}` : (registrationData.location || "Mumbai, Maharashtra"),
    maritalStatus: registrationData.maritalStatus || "",
    dependents: registrationData.dependents || "",
    education: registrationData.education || "",
    skills: registrationData.skills || "",
    employmentStatus: registrationData.employmentStatus || "Seeking Employment",
    monthlyIncome: registrationData.monthlyIncome || "",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    // Update profile when props change - prioritize props over defaults
    const updatedProfile = {
      name: userName || registrationData.name || profile.name,
      email: (email && email.trim()) ? email : (registrationData.email || profile.email),
      phone: (phone && phone.trim()) ? phone : (registrationData.phone || profile.phone),
      age: registrationData.age || profile.age,
      location: (city && city.trim() && state && state.trim()) ? `${city}, ${state}` : (registrationData.location || profile.location),
      maritalStatus: registrationData.maritalStatus || profile.maritalStatus,
      dependents: registrationData.dependents || profile.dependents,
      education: registrationData.education || profile.education,
      skills: registrationData.skills || profile.skills,
      employmentStatus: registrationData.employmentStatus || profile.employmentStatus,
      monthlyIncome: registrationData.monthlyIncome || profile.monthlyIncome,
    };
    setProfile(updatedProfile);
    setTempProfile(updatedProfile);
  }, [userName, email, phone, state, city, registrationData]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempProfile(profile);
  };

  const handleSave = async () => {
    try {
      // In a real app, send to backend
      // await fetch("http://localhost:5000/api/profile", {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(tempProfile),
      // });
      setProfile(tempProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ padding: "2rem 2rem 3rem", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        .profile-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--ink);
          background: var(--white);
          transition: all 0.2s;
        }
        .profile-input:focus {
          outline: none;
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(26, 107, 90, 0.1);
        }
        .profile-input:disabled {
          background: var(--bg2);
          color: var(--ink-m);
          cursor: not-allowed;
        }
        .profile-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--ink-m);
          margin-bottom: 0.5rem;
          letter-spacing: 0.01em;
        }
        .profile-btn {
          padding: 0.7rem 1.4rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .profile-btn-primary {
          background: var(--teal);
          color: white;
        }
        .profile-btn-primary:hover {
          background: var(--teal-d);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 107, 90, 0.2);
        }
        .profile-btn-secondary {
          background: var(--white);
          color: var(--ink-m);
          border: 1.5px solid var(--border);
        }
        .profile-btn-secondary:hover {
          background: var(--bg2);
          border-color: var(--ink-s);
        }
      `}</style>

      {/* Header */}
      <div className="a1" style={{ marginBottom: "2rem" }}>
        <h1 className="sf" style={{ fontSize: "2rem", fontWeight: 900, color: "var(--ink)", marginBottom: "0.5rem", lineHeight: 1.2 }}>
          My Profile
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-s)" }}>
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="card a2" style={{ marginBottom: "1.5rem", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* Avatar */}
          <div style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--teal), var(--teal-m))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: "2rem",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(26, 107, 90, 0.25)",
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h2 className="sf" style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--ink)", marginBottom: "0.3rem" }}>
              {profile.name}
            </h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {profile.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--ink-m)" }}>
                  <span>📧</span>
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--ink-m)" }}>
                  <span>📱</span>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--ink-m)" }}>
                  <span>📍</span>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <span className="badge badge-green">Member since 2024</span>
              <span className="badge badge-sand">Profile 85% Complete</span>
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <button
              className="profile-btn profile-btn-primary"
              onClick={handleEdit}
              style={{ flexShrink: 0 }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* Personal Information */}
        <div className="card a3" style={{ padding: "1.8rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>👤</span>
            Personal Information
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label className="profile-label">Full Name</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.name : profile.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="profile-label">Age</label>
                <input
                  type="text"
                  className="profile-input"
                  value={isEditing ? tempProfile.age : profile.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 35"
                />
              </div>
              <div>
                <label className="profile-label">Marital Status</label>
                <input
                  type="text"
                  className="profile-input"
                  value={isEditing ? tempProfile.maritalStatus : profile.maritalStatus}
                  onChange={(e) => handleChange("maritalStatus", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Married, Single, Widow"
                />
              </div>
            </div>

            <div>
              <label className="profile-label">Email Address</label>
              <input
                type="email"
                className="profile-input"
                value={isEditing ? tempProfile.email : profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="profile-label">Phone Number</label>
              <input
                type="tel"
                className="profile-input"
                value={isEditing ? tempProfile.phone : profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="profile-label">Location</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.location : profile.location}
                onChange={(e) => handleChange("location", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Family & Employment */}
        <div className="card a3" style={{ padding: "1.8rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>👨‍👩‍👧‍👦</span>
            Family & Employment
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label className="profile-label">Dependents</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.dependents : profile.dependents}
                onChange={(e) => handleChange("dependents", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="profile-label">Education Level</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.education : profile.education}
                onChange={(e) => handleChange("education", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., 12th Pass, Bachelor's Degree"
              />
            </div>

            <div>
              <label className="profile-label">Skills</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.skills : profile.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Tailoring, Cooking, Computer Skills"
              />
            </div>

            <div>
              <label className="profile-label">Employment Status</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.employmentStatus : profile.employmentStatus}
                onChange={(e) => handleChange("employmentStatus", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Seeking Employment, Employed"
              />
            </div>

            <div>
              <label className="profile-label">Monthly Income</label>
              <input
                type="text"
                className="profile-input"
                value={isEditing ? tempProfile.monthlyIncome : profile.monthlyIncome}
                onChange={(e) => handleChange("monthlyIncome", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., ₹8,000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="a5" style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          padding: "1.5rem",
          background: "var(--white)",
          borderRadius: 16,
          border: "1px solid var(--border)",
        }}>
          <button
            className="profile-btn profile-btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="profile-btn profile-btn-primary"
            onClick={handleSave}
          >
            💾 Save Changes
          </button>
        </div>
      )}
    </div>
  );
}