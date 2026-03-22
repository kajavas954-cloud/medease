import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart({ setActiveTab }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(items);
  }, []);

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
    setDiscountPercent(0);
    setCouponCode("");
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "CARE10") {
      setDiscountPercent(10);
      alert("10% Discount applied!");
    } else if (code === "SAVE20") {
      setDiscountPercent(20);
      alert("20% Discount applied!");
    } else {
      setDiscountPercent(0);
      alert("Invalid or Expired Coupon");
    }
  };

  const removeCoupon = () => {
    setDiscountPercent(0);
    setCouponCode("");
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = total - discountAmount;

  return (
    <div className="cart-container">
      <h2 className="cart-page-title">🛒 Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart flex-center">
          <h3 className="empty-title">Your cart is feeling a bit empty!</h3>
          <p className="empty-subtitle">Discover amazing medicines and add them here.</p>
          <button className="back-shopping-btn" onClick={() => {
            if (setActiveTab) setActiveTab("medicines");
            else navigate("/home");
          }}>
            ← Explore Medicines
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-list">
              {cartItems.map((item, index) => (
                <div className="cart-item" key={index}>
                  <img src={item.img} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="cart-item-cat">{item.category}</span>
                  </div>
                  <div className="cart-item-pricing">
                    <p className="cart-item-price">₹ {item.price}</p>
                    <span className="cart-item-delivery">🚚 Delivery in 2 days</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="clear-cart-link" onClick={clearCart}>
              ⚠️ Clear Entire Cart
            </button>
          </div>

          <div className="cart-summary-section">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="coupon-wrapper">
              <input 
                type="text" 
                placeholder="Enter Coupon (e.g. CARE10)" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={discountPercent > 0}
              />
              {discountPercent > 0 ? (
                <button className="remove-btn" onClick={removeCoupon}>Remove</button>
              ) : (
                <button className="apply-btn" onClick={applyCoupon}>Apply</button>
              )}
            </div>
            {discountPercent > 0 && <span className="coupon-success">✅ {discountPercent}% discount applied!</span>}

            <div className="summary-breakdown">
              <div className="s-row">
                <span>Subtotal</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
              <div className="s-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {discountPercent > 0 && (
                <div className="s-row discount">
                  <span>Discount</span>
                  <span>-₹ {discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="summary-total">
              <span>Final Total</span>
              <strong>₹ {finalTotal.toFixed(2)}</strong>
            </div>

            <button className="checkout-btn" onClick={() => navigate("/payment")}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
