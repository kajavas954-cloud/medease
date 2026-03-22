import React, { useEffect, useState } from "react";
import "./Overview.css";

function Overview({ userProfile, setActiveTab, setUserProfile }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSubscribed = userProfile?.isSubscribed || false;

  const handleSubscribeClick = () => {
    if (isSubscribed) return;
    setShowPaymentModal(true);
  };

  const processPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      if (setUserProfile) {
        const updatedUser = { ...userProfile, isSubscribed: true };
        setUserProfile(updatedUser);
        
        // Also update in localStorage so it persists
        const savedUser = JSON.parse(localStorage.getItem("registeredUser")) || {};
        localStorage.setItem("registeredUser", JSON.stringify({ ...savedUser, ...updatedUser }));
      }
      alert("🎉 Payment Successful! Welcome to MedEase Prime.");
    }, 2000);
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setCartCount(cart.length);
    setWishlistCount(wishlist.length);
  }, []);

  return (
    <div className="overview-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-text">
          <h1>Welcome back, {userProfile?.name}! 👋</h1>
          <p>Here is what's happening with your health and orders today.</p>
        </div>
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/online-doctor-consultation-4481545-3733075.png?f=webp" alt="Welcome" className="banner-image" />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab("orders")}>
          <div className="stat-icon orders-icon">📦</div>
          <div className="stat-info">
            <h3>Orders</h3>
            <p>2 Active, 5 Past</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab("prescription")}>
          <div className="stat-icon rx-icon">📝</div>
          <div className="stat-info">
            <h3>Prescriptions</h3>
            <p>1 Pending Renewal</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab("cart")}>
          <div className="stat-icon cart-icon">🛒</div>
          <div className="stat-info">
            <h3>Cart</h3>
            <p>{cartCount} Items waiting</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab("wishlist")}>
          <div className="stat-icon heart-icon">❤️</div>
          <div className="stat-info">
            <h3>Wishlist</h3>
            <p>{wishlistCount} Saved items</p>
          </div>
        </div>
      </div>
      {/* Subscription Banner */}
      <div className="subscription-banner">
        <div className="sub-banner-content">
          <span className="sub-badge">NEW</span>
          <h2>MedEase Prime ✨</h2>
          <p>Get unlimited free deliveries, 15% off all medicines, and priority doctor consultations starting at $5/mo.</p>
        </div>
        <button 
          className={`sub-btn ${isSubscribed ? 'active-sub' : ''}`} 
          onClick={handleSubscribeClick}
          disabled={isSubscribed}
        >
          {isSubscribed ? "✓ Subscribed" : "Subscribe Now"}
        </button>
      </div>
      {/* Quick Actions / Featured */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-box" onClick={() => setActiveTab("medicines")}>
            <div className="action-icon">💊</div>
            <h4>Order Medicines</h4>
            <p>Browse our extensive pharmacy</p>
          </div>
          <div className="action-box" onClick={() => setActiveTab("adviser")}>
            <div className="action-icon">👨‍⚕️</div>
            <h4>Consult Doctor</h4>
            <p>Get instant expert advice</p>
          </div>
          <div className="action-box" onClick={() => setActiveTab("payment")}>
            <div className="action-icon">💳</div>
            <h4>Payment Methods</h4>
            <p>Manage cards & wallets</p>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <button className="close-modal-btn" onClick={() => setShowPaymentModal(false)}>✖</button>
            <div className="pm-header">
              <h2>MedEase Prime</h2>
              <p>Secure Credit/Debit Card Checkout</p>
            </div>
            <div className="pm-price">
              <h3>$5.00</h3>
              <span>/ month</span>
            </div>
            
            <form onSubmit={processPayment} className="modal-payment-form">
              <div className="pm-input-group">
                <label>Cardholder Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="pm-input-group">
                <label>Card Number</label>
                <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength="19" required />
              </div>
              <div className="pm-row-group">
                <div className="pm-input-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" maxLength="5" required />
                </div>
                <div className="pm-input-group">
                  <label>CVV</label>
                  <input type="password" placeholder="123" maxLength="3" required />
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`pm-submit-btn ${isProcessing ? 'processing' : ''}`}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing Securely..." : "Pay $5.00 & Subscribe"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Overview;
