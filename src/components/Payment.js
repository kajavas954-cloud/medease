import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import PaymentSuccessPopup from "./PaymentSuccessPopup";
import "./Payment.css";

function Payment({ setActiveTab }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [method, setMethod] = useState("card");
  const [slot, setSlot] = useState("Today, 2:00 PM - 6:00 PM");
  const [cartTotal, setCartTotal] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

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

  // Net Banking state
  const [nbBank,    setNbBank]    = useState("");
  const [nbAccNo,   setNbAccNo]   = useState("");
  const [nbIfsc,    setNbIfsc]    = useState("");
  const [nbAccType, setNbAccType] = useState("Savings");

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
      if (!nbBank) {
        toast("Please select a Bank.", "error"); return;
      }
      if (!nbAccNo || nbAccNo.length < 8) {
        toast("Please enter a valid Account Number (min 8 digits).", "error"); return;
      }
      if (!nbIfsc || nbIfsc.length < 11) {
        toast("Please enter a valid 11-character IFSC Code.", "error"); return;
      }
    }

    // Build structured address object
    const addressPayload = JSON.stringify({
      street: addressData.streetAddress,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode
    });

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
          address: addressPayload,
          deliveryTimeSlot: slot,
          totalAmount: cartTotal,
          paymentMethod: method
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
          setPaidAmount(cartTotal);
          setShowSuccess(true);
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
    setPaidAmount(cartTotal);
    setShowSuccess(true);
  };

  return (
    <>
      {showSuccess && (
        <PaymentSuccessPopup
          amount={paidAmount}
          subtitle="Your order has been placed successfully."
          onClose={() => {
            setShowSuccess(false);
            if (setActiveTab) setActiveTab("orders");
            else navigate("/orders");
          }}
        />
      )}
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

                {method === "netbanking" && (() => {
                  const NETBANKS = [
                    { id: "sbi",    name: "SBI",      abbr: "SBI",   color: "#1a237e" },
                    { id: "hdfc",   name: "HDFC",     abbr: "HDFC",  color: "#004c8c" },
                    { id: "icici",  name: "ICICI",    abbr: "ICICI", color: "#f57c00" },
                    { id: "axis",   name: "Axis",     abbr: "AXIS",  color: "#8d1b3d" },
                    { id: "kotak",  name: "Kotak",    abbr: "KMB",   color: "#e50027" },
                    { id: "pnb",    name: "PNB",      abbr: "PNB",   color: "#155724" },
                    { id: "bob",    name: "BoB",      abbr: "BOB",   color: "#d97706" },
                    { id: "canara", name: "Canara",   abbr: "CAN",   color: "#1565c0" },
                    { id: "yes",    name: "Yes Bank", abbr: "YES",   color: "#0288d1" },
                    { id: "iob",    name: "IOB",      abbr: "IOB",   color: "#558b2f" },
                  ];
                  return (
                    <div className="payment-form nb-form">
                      {/* Bank tiles */}
                      <div className="nb-field">
                        <label className="field-label">Select Your Bank</label>
                        <div className="nb-grid">
                          {NETBANKS.map(b => (
                            <button
                              key={b.id}
                              type="button"
                              className={`nb-tile${nbBank === b.id ? " selected" : ""}`}
                              onClick={() => setNbBank(b.id)}
                            >
                              <div className="nb-logo" style={{ background: b.color }}>{b.abbr}</div>
                              <span className="nb-name">{b.name}</span>
                              {nbBank === b.id && <span className="nb-check">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Account Number */}
                      <div className="nb-field">
                        <label className="field-label">Account Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter your bank account number"
                          value={nbAccNo}
                          maxLength={18}
                          onChange={e => setNbAccNo(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>

                      {/* IFSC Code */}
                      <div className="nb-field">
                        <label className="field-label">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="e.g. SBIN0001234"
                          value={nbIfsc}
                          maxLength={11}
                          onChange={e => setNbIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                        />
                        <span className="nb-hint">11-character code printed on your cheque book</span>
                      </div>

                      {/* Account Type */}
                      <div className="nb-field">
                        <label className="field-label">Account Type</label>
                        <div className="nb-actype-row">
                          {["Savings", "Current", "Salary"].map(type => (
                            <button
                              key={type}
                              type="button"
                              className={`nb-actype-btn${nbAccType === type ? " selected" : ""}`}
                              onClick={() => setNbAccType(type)}
                            >{type}</button>
                          ))}
                        </div>
                      </div>

                      <div className="nb-secure-note">
                        🔒 Your credentials are verified directly with your bank via an encrypted channel. We do not store any banking details.
                      </div>
                    </div>
                  );
                })()}
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
    </>
  );
}

export default Payment;
