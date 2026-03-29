import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import "./Cart.css";

function Cart({ setActiveTab }) {
  const navigate = useNavigate();
  const toast = useToast();
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
      toast("10% Discount applied!");
    } else if (code === "SAVE20") {
      setDiscountPercent(20);
      toast("20% Discount applied!");
    } else {
      setDiscountPercent(0);
      toast("Invalid or Expired Coupon", "error");
    }
  };

  const removeCoupon = () => {
    setDiscountPercent(0);
    setCouponCode("");
  };

  const updateQuantity = (itemName, amount) => {
    let updatedCart = [...cartItems];
    const itemIndex = updatedCart.findIndex(i => i.name === itemName);
    if (itemIndex !== -1) {
      const currentQty = updatedCart[itemIndex].quantity || 1;
      const newQty = currentQty + amount;
      
      if (newQty <= 0) {
        updatedCart.splice(itemIndex, 1);
      } else {
        updatedCart[itemIndex].quantity = newQty;
      }
      
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const removeItem = (itemName) => {
    const updatedCart = cartItems.filter(i => i.name !== itemName);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
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
                    {item.prescriptionUrl && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#27ae60', background: '#eafaf1', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #c8e6c9' }}>
                        <span style={{ fontSize: '14px' }}>✓</span> Rx Attached
                      </div>
                    )}
                  </div>
                  <div className="cart-item-pricing" style={{alignItems: 'flex-end', gap: '8px', minWidth: '120px'}}>
                    <p className="cart-item-price" style={{marginBottom: '5px'}}>₹ {(item.price * (item.quantity || 1)).toFixed(2)}</p>
                    <div className="cart-qty-controls" style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f6fa', padding: '4px 8px', borderRadius: '6px'}}>
                      <button onClick={() => updateQuantity(item.name, -1)} style={{border: 'none', background: '#dcdde1', borderRadius: '4px', width: '22px', cursor: 'pointer', fontWeight: 'bold'}}>-</button>
                      <span style={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '15px', textAlign: 'center'}}>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(item.name, 1)} style={{border: 'none', background: '#1abc9c', color: 'white', borderRadius: '4px', width: '22px', cursor: 'pointer', fontWeight: 'bold'}}>+</button>
                    </div>
                  </div>
                  <button className="remove-item-btn" onClick={() => removeItem(item.name)} style={{background: '#ff7675', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto', height: 'fit-content', alignSelf: 'center', fontSize: '0.85rem'}}>Remove</button>
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

            <button className="checkout-btn" onClick={() => {
              if (setActiveTab) setActiveTab("payment");
              else navigate("/payment");
            }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
