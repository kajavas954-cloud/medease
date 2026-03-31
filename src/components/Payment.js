import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import "./Payment.css";

function Payment({ setActiveTab }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [method, setMethod] = useState("card");
  const [slot, setSlot] = useState("Today, 2:00 PM - 6:00 PM");
  const [cartTotal, setCartTotal] = useState(0);

  // Structured address (same fields as Settings > Manage Address)
  const [addressData, setAddressData] = useState({
    streetAddress: "",
    city: "",
    state: "",
    postalCode: ""
  });

  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setCartTotal(total);

    // Pre-fill address from saved user profile (same source as Settings)
    const user = JSON.parse(localStorage.getItem("registeredUser")) || {};
    setAddressData({
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      postalCode: user.postalCode || ""
    });
  }, []);

  // ── Address handlers ──────────────────────────────────────────────
  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  // ── Card input handlers ───────────────────────────────────────────

  // Card Number: digits only, max 16
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardDetails({ ...cardDetails, number: val });
  };

  // MM/YY: digits only, auto-insert "/" after 2 digits
  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // strip non-digits
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardDetails({ ...cardDetails, expiry: val });
  };

  // CVV: digits only, max 3
  const handleCvv = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardDetails({ ...cardDetails, cvv: val });
  };

  // Card Holder Name: alphabets + spaces only
  const handleCardName = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCardDetails({ ...cardDetails, name: val });
  };

  // ── Payment submit ────────────────────────────────────────────────
  const handlePayment = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      toast("Your cart is empty!", "error");
      return;
    }

    // Validate address fields
    if (!addressData.streetAddress.trim()) {
      toast("Street Address is required.", "error"); return;
    }
    if (!addressData.city.trim()) {
      toast("City is required.", "error"); return;
    }
    if (!addressData.state.trim()) {
      toast("State / Province is required.", "error"); return;
    }
    if (!addressData.postalCode.trim()) {
      toast("Postal Code is required.", "error"); return;
    }

    // Validate card
    if (method === "card") {
      if (!cardDetails.number || cardDetails.number.length < 16) {
        toast("Please enter a valid 16-digit Card Number.", "error"); return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        toast("Please enter a valid Expiry Date (MM/YY).", "error"); return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        toast("Please enter a valid 3-digit CVV.", "error"); return;
      }
      if (!cardDetails.name.trim()) {
        toast("Card Holder Name is required.", "error"); return;
      }
    } else if (method === "upi") {
      if (!upiId.trim()) {
        toast("Please enter a valid UPI ID.", "error"); return;
      }
    } else if (method === "netbanking") {
      if (!bank) {
        toast("Please select a Bank from the dropdown.", "error"); return;
      }
    }

    // Build combined address string for backend
    const address = `${addressData.streetAddress}, ${addressData.city}, ${addressData.state} ${addressData.postalCode}`.trim();

    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const orderData = {
          items: cart.map(c => {
            if (!c.id) {
              throw new Error(`Technical error: Missing product ID for ${c.name}. Please re-add to cart.`);
            }
            return {
              medicineId: c.id,
              quantity: c.quantity || 1,
              priceAtTime: c.price
            };
          }),
          address,
          deliveryTimeSlot: slot,
          totalAmount: cartTotal
        };

        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.removeItem("cart");
          toast("Payment Successful! Your order has been placed.");
          if (setActiveTab) setActiveTab("orders");
          else navigate("/orders");
          return;
        } else {
          toast(data.message || "Failed to place order. Please try again.", "error");
          return;
        }
      } catch (err) {
        console.error("Order processing error:", err);
        toast(err.message || "Connection error. Please try again later.", "error");
        return;
      }
    }

    // Fallback (no token / backend offline)
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

    toast("Payment Successful!");
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

            {/* ── Step 1: Delivery Address ── */}
            <div className="checkout-step">
              <h3 className="method-title">1. Delivery Address</h3>
              <div className="address-form">
                <div className="form-field">
                  <label className="field-label">Street Address</label>
                  <input
                    type="text"
                    name="streetAddress"
                    className="address-input"
                    placeholder="e.g. 123 Main Street, Apt 4B"
                    value={addressData.streetAddress}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="address-row">
                  <div className="form-field">
                    <label className="field-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="address-input"
                      placeholder="e.g. Mumbai"
                      value={addressData.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      className="address-input"
                      placeholder="e.g. Maharashtra"
                      value={addressData.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-field postal-field">
                  <label className="field-label">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="address-input"
                    placeholder="e.g. 400001"
                    value={addressData.postalCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Step 2: Delivery Slot ── */}
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

            {/* ── Step 3: Payment Method ── */}
            <div className="checkout-step">
              <h3 className="method-title">3. Select Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-option ${method === "card" ? "active" : ""}`}>
                  <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
                  <span>💳 Debit / Credit Card</span>
                </label>
                <label className={`payment-option ${method === "upi" ? "active" : ""}`}>
                  <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} />
                  <span>📱 UPI</span>
                </label>
                <label className={`payment-option ${method === "netbanking" ? "active" : ""}`}>
                  <input type="radio" checked={method === "netbanking"} onChange={() => setMethod("netbanking")} />
                  <span>🏦 Net Banking</span>
                </label>
              </div>

              <div className="payment-forms-area">
                {method === "card" && (
                  <div className="payment-form">
                    {/* Card Number — digits only */}
                    <div className="card-field-wrap">
                      <label className="field-label">Card Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        maxLength="16"
                        value={cardDetails.number}
                        onChange={handleCardNumber}
                      />
                    </div>

                    <div className="row">
                      {/* MM/YY — auto-slash */}
                      <div className="card-field-wrap" style={{ flex: 1 }}>
                        <label className="field-label">Expiry Date</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM / YY"
                          maxLength="5"
                          value={cardDetails.expiry}
                          onChange={handleExpiry}
                        />
                      </div>

                      {/* CVV — digits only */}
                      <div className="card-field-wrap" style={{ flex: 1 }}>
                        <label className="field-label">CVV</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="•••"
                          maxLength="3"
                          value={cardDetails.cvv}
                          onChange={handleCvv}
                        />
                      </div>
                    </div>

                    {/* Card Holder Name — alphabets only */}
                    <div className="card-field-wrap">
                      <label className="field-label">Card Holder Name</label>
                      <input
                        type="text"
                        placeholder="Name as on card"
                        value={cardDetails.name}
                        onChange={handleCardName}
                      />
                    </div>
                  </div>
                )}

                {method === "upi" && (
                  <div className="payment-form">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. name@bank)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
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

          {/* ── Right: Summary ── */}
          <div className="checkout-right">
            <div className="payment-amount-display">
              <span>Total Amount:</span>
              <strong>₹ {cartTotal.toFixed(2)}</strong>
            </div>

            <button className="pay-btn" onClick={handlePayment}>
              Confirm &amp; Place Order
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
