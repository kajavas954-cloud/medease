import React, { useState } from "react";
import "./Settings.css";

function Settings({ userProfile, setUserProfile }) {
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

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

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
        alert("✅ " + data.message);
        const savedUser = JSON.parse(localStorage.getItem("registeredUser")) || {};
        const updatedUser = { ...savedUser, ...addressData };
        localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
        if (setUserProfile) setUserProfile(updatedUser);
      } else {
        alert("❌ " + (data.message || "Failed to update address."));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server is unreachable.");
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

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("❌ New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("❌ New password must be at least 6 characters long.");
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
        alert("✅ " + data.message);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert("❌ " + (data.message || "Failed to change password."));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server is unreachable. Please verify your connection.");
    } finally {
      setPasswordLoading(false);
    }
  };

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
                  <input type="text" name="city" value={addressData.city} onChange={handleAddressChange} required />
                </div>
                <div className="form-group">
                  <label>State / Province</label>
                  <input type="text" name="state" value={addressData.state} onChange={handleAddressChange} required />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" name="postalCode" value={addressData.postalCode} onChange={handleAddressChange} required />
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
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength="6" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required minLength="6" />
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
