import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = JSON.parse(localStorage.getItem("lastOrder"));
    setOrder(savedOrder);
  }, []);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✔</div>

        <h2>Payment Successful</h2>
        <p>Your order has been placed successfully.</p>

        {order && (
          <div className="success-details">
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Order Date:</strong> {order.orderDate}</p>
          </div>
        )}

        <button onClick={() => navigate("/orders")}>
          View My Orders
        </button>

        <button
          className="home-btn"
          onClick={() => navigate("/home")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
