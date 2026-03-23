import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

function Payment({ setActiveTab }) {
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [address, setAddress] = useState("");
  const [slot, setSlot] = useState("Today, 2:00 PM - 6:00 PM");
  const [cartTotal, setCartTotal] = useState(0);

  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setCartTotal(total);

    const user = JSON.parse(localStorage.getItem("registeredUser")) || {};
    if (user.streetAddress) {
      setAddress(`${user.streetAddress}, ${user.city}, ${user.state} ${user.postalCode}`);
    }
  }, []);

  const handlePayment = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!address || !address.trim()) {
      alert("Delivery Address is required. Please fill it in.");
      return;
    }

    if (method === "card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        alert("Validation Error: Please completely fill out all Card Details (Number, Expiry, CVV, and Name).");
        return;
      }
    } else if (method === "upi") {
      if (!upiId || !upiId.trim()) {
        alert("Validation Error: Please enter a correct UPI ID.");
        return;
      }
    } else if (method === "netbanking") {
      if (!bank || bank === "") {
        alert("Validation Error: You must formally select a Bank from the dropdown list.");
        return;
      }
    }

    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-auth-token": token
          },
          body: JSON.stringify({
            items: cart.map(c => ({ medicineId: c.id || 1, quantity: 1, priceAtTime: c.price })),
            address,
            deliveryTimeSlot: slot,
            totalAmount: cartTotal
          })
        });
        
        if (res.ok) {
          localStorage.removeItem("cart");
          alert("Payment Successful! Order securely placed on backend.");
          if (setActiveTab) setActiveTab("orders");
          else navigate("/orders");
          return;
        } else {
          console.error("Order failed on backend");
        }
      } catch (err) {
        console.error("Backend unreachable", err);
      }
    }

    // Fallback if backend is not running or no token
    const orderId = "ME" + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleString();

    const newOrder = {
      orderId,
      orderDate,
      deliveryAddress: address,
      deliverySlot: slot,
      paymentMethod: method,
      status: "Processing",
      items: cart,
      total: cartTotal
    };

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(newOrder);

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.removeItem("cart");

    alert("Payment Successful! Redirecting to orders...");
    if (setActiveTab) setActiveTab("orders");
    else navigate("/orders");
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header-block">
          <h2>Secure Checkout</h2>
          <p className="payment-subtitle">Complete your purchase securely.</p>
        </div>

        <div className="payment-grid">
          <div className="checkout-left">
            <div className="checkout-step">
              <h3 className="method-title">1. Delivery Address</h3>
              <textarea 
                className="checkout-textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                rows="3"
                required
              />
            </div>

            <div className="checkout-step">
              <h3 className="method-title">2. Choose Delivery Slot</h3>
              <div className="payment-options">
                <label className={`payment-option ${slot === "Today, 2:00 PM - 6:00 PM" ? "active" : ""}`}>
                  <input type="radio" checked={slot === "Today, 2:00 PM - 6:00 PM"} onChange={() => setSlot("Today, 2:00 PM - 6:00 PM")} />
                  <span>Today 2PM - 6PM</span>
                </label>
                <label className={`payment-option ${slot === "Tomorrow, 9:00 AM - 1:00 PM" ? "active" : ""}`}>
                  <input type="radio" checked={slot === "Tomorrow, 9:00 AM - 1:00 PM"} onChange={() => setSlot("Tomorrow, 9:00 AM - 1:00 PM")} />
                  <span>Tomorrow 9AM - 1PM</span>
                </label>
                <label className={`payment-option ${slot === "Standard (2-3 Days)" ? "active" : ""}`}>
                  <input type="radio" checked={slot === "Standard (2-3 Days)"} onChange={() => setSlot("Standard (2-3 Days)")} />
                  <span>Standard (2-3 Days)</span>
                </label>
              </div>
            </div>

            <div className="checkout-step">
              <h3 className="method-title">3. Select Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-option ${method === "card" ? "active" : ""}`}>
                  <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
                  <span>Debit / Credit Card</span>
                </label>
                <label className={`payment-option ${method === "upi" ? "active" : ""}`}>
                  <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} />
                  <span>UPI</span>
                </label>
                <label className={`payment-option ${method === "netbanking" ? "active" : ""}`}>
                  <input type="radio" checked={method === "netbanking"} onChange={() => setMethod("netbanking")} />
                  <span>Net Banking</span>
                </label>
              </div>

              <div className="payment-forms-area">
                {method === "card" && (
                  <div className="payment-form">
                    <input type="text" placeholder="Card Number" maxLength="16" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} />
                    <div className="row">
                      <input type="text" placeholder="MM / YY" maxLength="5" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                      <input type="password" placeholder="CVV" maxLength="3" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                    </div>
                    <input type="text" placeholder="Card Holder Name" value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })} />
                  </div>
                )}
                {method === "upi" && (
                  <div className="payment-form">
                    <input type="text" placeholder="Enter UPI ID (e.g. name@bank)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  </div>
                )}
                {method === "netbanking" && (
                  <div className="payment-form">
                    <select value={bank} onChange={(e) => setBank(e.target.value)}>
                      <option value="" disabled>Select your Bank</option>
                      <option value="sbi">SBI</option>
                      <option value="hdfc">HDFC</option>
                      <option value="icici">ICICI</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="payment-amount-display">
              <span>Total Amount:</span>
              <strong>₹ {cartTotal.toFixed(2)}</strong>
            </div>
            
            <button className="pay-btn" onClick={handlePayment}>
              Confirm & Place Order
            </button>

            <button className="back-home-btn auto-mt" onClick={() => navigate("/cart")}>
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
