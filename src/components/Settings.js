import React, { useState } from "react";
import "./Settings.css";

function Settings({ userProfile, setUserProfile }) {
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({ 
    ...(userProfile || {
      name: "Alex Johnson",
      email: "alex.j@example.com",
      phone: "+1 987 654 3210",
      dob: "1995-05-15",
      gender: "M",
      bloodGroup: "O+"
    })
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    if (setUserProfile) {
      setUserProfile({ ...userProfile, ...formData });
      
      const savedUser = JSON.parse(localStorage.getItem("registeredUser")) || {};
      const updatedUser = { ...savedUser, ...formData };
      localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
    }
    alert("✅ Personal Info saved! It will update globally immediately.");
  };

  // Generic handler for mocked forms
  const handleGenericSave = (e) => {
    e.preventDefault();
    alert("✅ Changes saved successfully!");
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
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px' }}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px' }}>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
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
              <form onSubmit={handleGenericSave}>
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" defaultValue="123 Healthway" required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" defaultValue="New York" required />
                </div>
                <div className="form-group">
                  <label>State / Province</label>
                  <input type="text" defaultValue="NY" required />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" defaultValue="10001" required />
                </div>
                <button type="submit" className="save-btn">Update Address</button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="settings-section">
              <h3>Change Password</h3>
              <form onSubmit={handleGenericSave}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" required />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" required />
                </div>
                <button type="submit" className="save-btn">Update Password</button>
              </form>
            </div>
          )}

          {activeTab === "support" && (
            <div className="settings-section support-section">
              <h3>Help & Support</h3>
              <p>Experiencing issues or need help with a prescription or order?</p>
              <div className="support-cards">
                <div className="support-card">
                  <h4>📞 Call Us</h4>
                  <p>1-800-MED-EASE</p>
                  <span>Mon-Sun, 24/7 Hours</span>
                </div>
                <div className="support-card">
                  <h4>📧 Email Support</h4>
                  <p>support@medease.com</p>
                  <span>We reply within 2 hours</span>
                </div>
              </div>
              <form onSubmit={handleGenericSave} className="ticket-form">
                <div className="form-group">
                  <label>Create a Support Ticket</label>
                  <textarea rows="4" placeholder="Describe your issue here..." required></textarea>
                </div>
                <button type="submit" className="save-btn">Submit Ticket</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
