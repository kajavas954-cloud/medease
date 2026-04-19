import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Medicines from "./Medicines";
import Cart from "./Cart";
import Orders from "./Orders";
import Payment from "./Payment";
import Wishlist from "./Wishlist";
import Adviser from "./Adviser";

import Appointments from "./Appointments";
import Settings from "./Settings";
import Overview from "./Overview";
import Footer from "./Footer";
import "./Dashboard.css";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showBrandDetails, setShowBrandDetails] = useState(false);
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cartItems.length);
    };
    
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const [userProfile, setUserProfile] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("registeredUser"));
    return {
      name: savedUser?.name || "Alex Johnson",
      email: savedUser?.email || "alex.j@example.com",
      phone: savedUser?.phone || "+1 987 654 3210",
      age: savedUser?.age || "Not Set",
      gender: savedUser?.gender || "Not Set",
      bloodGroup: savedUser?.bloodGroup || "Not Set",
      profilePicUrl: savedUser?.profilePicUrl || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
    };
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="brand-section">
          <div 
            className="brand-header" 
            onClick={() => setShowBrandDetails(!showBrandDetails)}
          >
            <div className="brand-title-wrap">
              <div className="brand-logo">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" fill="#1abc9c"/>
                  <path d="M16 11.5H13V8.5H11V11.5H8V13.5H11V16.5H13V13.5H16V11.5Z" fill="white"/>
                </svg>
              </div>
              <span className="brand-text">MedEase</span>
            </div>
            <span className="profile-chevron">{showBrandDetails ? "▲" : "▼"}</span>
          </div>

          {showBrandDetails && (
            <div className="brand-popup">
              <div className="brand-popup-item">
                <span className="bp-icon">📧</span>
                <span className="bp-text">medease.apk@gmail.com</span>
              </div>
              <div className="brand-popup-item">
                <span className="bp-icon">📞</span>
                <span className="bp-text">+1-800-MED-EASE</span>
              </div>
              <div className="brand-popup-item">
                <span className="bp-icon">📍</span>
                <span className="bp-text">123 Healthway, NY 10001</span>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-menu">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>

          <button
            className={activeTab === "medicines" ? "active" : ""}
            onClick={() => setActiveTab("medicines")}
          >
            🧪 Medicines
          </button>



          <button
            className={`cart-btn-wrap ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            <span className="cart-icon-container">
              🛒
              {cartCount > 0 && (
                <span className="cart-badge-global" key={cartCount}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>
            <span className="cart-text-spacing">Cart</span>
          </button>

          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            📦 Orders
          </button>

          <button
            className={activeTab === "payment" ? "active" : ""}
            onClick={() => setActiveTab("payment")}
          >
            💳 Payment
          </button>

          <button
            className={activeTab === "adviser" ? "active" : ""}
            onClick={() => setActiveTab("adviser")}
          >
            👨‍⚕️ Quick Doctor Connect
          </button>

          <button
            className={activeTab === "wishlist" ? "active" : ""}
            onClick={() => setActiveTab("wishlist")}
          >
            ❤️ Wishlist
          </button>

          <button
            className={activeTab === "appointments" ? "active" : ""}
            onClick={() => setActiveTab("appointments")}
          >
            🏥 Book Appointment
          </button>

          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings & Support
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        <div className="sidebar-footer">
          {showProfile && (
            <div className="profile-popup">
              <div className="profile-popup-header">
                <img src={userProfile.profilePicUrl} alt="User" />
                <div className="profile-popup-info">
                  <h4>{userProfile.name}</h4>
                  <p>{userProfile.email}</p>
                </div>
              </div>
              <div className="profile-popup-stats">
                <div className="stat">
                  <span>Age</span>
                  <strong>{userProfile.age}</strong>
                </div>
                <div className="stat">
                  <span>Gender</span>
                  <strong>{userProfile.gender}</strong>
                </div>
                <div className="stat">
                  <span>Blood</span>
                  <strong>{userProfile.bloodGroup}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="user-profile" onClick={() => setShowProfile(!showProfile)}>
            <div className="user-profile-left">
              <img src={userProfile.profilePicUrl} alt="User Profile" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">{userProfile.name}</span>
                <span className="user-role">Patient</span>
              </div>
            </div>
            <span className="profile-chevron">{showProfile ? "▼" : "▲"}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="dashboard-main-area">
        {/* <div className="minimal-topbar">
          <h2 className="topbar-title">MedEase Portal</h2>
          <span className="topbar-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div> */}

        <div className="dashboard-content" ref={contentRef}>
        {activeTab === "overview" && <Overview userProfile={userProfile} setActiveTab={setActiveTab} setUserProfile={setUserProfile} />}
        {activeTab === "medicines" && (
          <Medicines 
            searchQuery={medicineSearch} 
            onSearchChange={setMedicineSearch} 
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "cart" && <Cart setActiveTab={setActiveTab} />}
        {activeTab === "orders" && <Orders setActiveTab={setActiveTab} />}
        {activeTab === "payment" && <Payment setActiveTab={setActiveTab} />}
        {activeTab === "adviser" && (
          <Adviser 
            onSelectMedicine={(med) => {
              setMedicineSearch(med);
              setActiveTab("medicines");
            }} 
          />
        )}
        {activeTab === "wishlist" && <Wishlist />}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "settings" && <Settings userProfile={userProfile} setUserProfile={setUserProfile} />}
        
        <Footer />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
