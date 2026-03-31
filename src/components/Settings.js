import React, { useState } from "react";
import { useToast } from "./ToastProvider";
import "./Settings.css";

function Settings({ userProfile, setUserProfile }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({ 
    ...(userProfile || {
      name: "Alex Johnson",
      email: "alex.j@example.com",
      phone: "+1 987 654 3210",
      age: "",
      gender: "",
      bloodGroup: ""
    }),
    age: userProfile?.age === "Not Set" ? "" : (userProfile?.age || ""),
    gender: userProfile?.gender === "Not Set" ? "" : (userProfile?.gender || ""),
    bloodGroup: userProfile?.bloodGroup === "Not Set" ? "" : (userProfile?.bloodGroup || "")
  });

  const [addressData, setAddressData] = useState({
    streetAddress: userProfile?.streetAddress || "",
    city: userProfile?.city || "",
    state: userProfile?.state || "",
    postalCode: userProfile?.postalCode || ""
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // handleAddressChange is defined later with validation

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/auth/update-address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify(addressData)
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message);
        const savedUser = JSON.parse(localStorage.getItem("registeredUser")) || {};
        const updatedUser = { ...savedUser, ...addressData };
        localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
        if (setUserProfile) setUserProfile(updatedUser);
      } else {
        toast(data.message || "Failed to update address.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Server is unreachable.", "error");
    } finally {
      setAddressLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Show/hide toggles for each password field
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast("New passwords do not match!", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast("New password must be at least 6 characters long.", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast(data.message);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast(data.message || "Failed to change password.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Server is unreachable. Please verify your connection.", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Personal Info handlers ──────────────────────────────────────
  // Full Name: letters + spaces only
  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setFormData({ ...formData, name: val });
  };

  // Phone: digits only
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, phone: val });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Address handlers with validation ────────────────────────────
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === "city" || name === "state") {
      filtered = value.replace(/[^a-zA-Z\s]/g, ""); // letters + spaces only
    } else if (name === "postalCode") {
      filtered = value.replace(/\D/g, ""); // digits only
    }
    setAddressData({ ...addressData, [name]: filtered });
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    if (setUserProfile) {
      setUserProfile({ ...userProfile, ...formData });
      
      const savedUser = JSON.parse(localStorage.getItem("registeredUser")) || {};
      const updatedUser = { ...savedUser, ...formData };
      localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
    }
    toast("Personal Info saved!");
  };

  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || "Unknown User",
          email: formData.email || "unknown@example.com",
          message: supportMessage
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message);
        setSupportMessage("");
      } else {
        toast(data.message || "Failed to submit ticket.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Server is unreachable. Please verify your connection.", "error");
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>⚙️ Settings & Support</h2>
      <p>Manage your account, update personal information, and handle support requests.</p>
      
      <div className="settings-layout">
        <div className="settings-sidebar">
          <button className={activeTab === "personal" ? "active" : ""} onClick={() => setActiveTab("personal")}>👤 Personal Info</button>
          <button className={activeTab === "address" ? "active" : ""} onClick={() => setActiveTab("address")}>📍 Manage Address</button>
          <button className={activeTab === "password" ? "active" : ""} onClick={() => setActiveTab("password")}>🔒 Change Password</button>
          <button className={activeTab === "support" ? "active" : ""} onClick={() => setActiveTab("support")}>🎧 Contact Support</button>
        </div>

        <div className="settings-content">
          {activeTab === "personal" && (
            <div className="settings-section">
              <h3>Update Personal Info</h3>
              <form onSubmit={handleSavePersonal}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Alphabets only"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Digits only"
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} min="1" max="120" />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px' }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px' }}>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Rather not say">Rather not say</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === "address" && (
            <div className="settings-section">
              <h3>Manage Address</h3>
              <form onSubmit={handleSaveAddress}>
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" name="streetAddress" value={addressData.streetAddress} onChange={handleAddressChange} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    placeholder="Alphabets only"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    placeholder="Alphabets only"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    inputMode="numeric"
                    value={addressData.postalCode}
                    onChange={handleAddressChange}
                    placeholder="Digits only"
                    required
                  />
                </div>
                <button type="submit" className="save-btn" disabled={addressLoading}>
                  {addressLoading ? "Updating..." : "Update Address"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="settings-section">
              <h3>Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrent ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      style={{ paddingRight: '40px' }}
                      required
                    />
                    <span
                      onClick={() => setShowCurrent(v => !v)}
                      style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center' }}
                      title={showCurrent ? "Hide password" : "Show password"}
                    >
                      {showCurrent ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      style={{ paddingRight: '40px' }}
                      required
                      minLength="6"
                    />
                    <span
                      onClick={() => setShowNew(v => !v)}
                      style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center' }}
                      title={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      style={{ paddingRight: '40px' }}
                      required
                      minLength="6"
                    />
                    <span
                      onClick={() => setShowConfirm(v => !v)}
                      style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center' }}
                      title={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </span>
                  </div>
                </div>
                <button type="submit" className="save-btn" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "support" && (
            <div className="settings-section support-section">
              <h3>Help & Support</h3>
              <p>Experiencing issues or need help with an order?</p>
              <div className="support-cards">
                <div className="support-card">
                  <h4>📞 Call Us</h4>
                  <p>1-800-MED-EASE</p>
                  <span>Mon-Sun, 24/7 Hours</span>
                </div>
                <div className="support-card">
                  <h4>📧 Email Support</h4>
                  <p>medease.apk@gmail.com</p>
                  <span>We reply within 2 hours</span>
                </div>
              </div>
              <form onSubmit={handleSubmitTicket} className="ticket-form">
                <div className="form-group">
                  <label>Create a Support Ticket</label>
                  <textarea 
                    rows="4" 
                    placeholder="Describe your issue here..." 
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="save-btn" disabled={supportLoading}>
                  {supportLoading ? "Submitting..." : "Submit Ticket"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
