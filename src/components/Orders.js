import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/orders", {
            headers: { "x-auth-token": token }
          });
          if (res.ok) {
            const data = await res.json();
            // Map backend data to frontend format
            const mappedOrders = data.map(o => ({
              id: o.id,
              status: o.status,
              total: o.totalAmount,
              items: o.OrderItems.map(oi => ({
                name: oi.Medicine?.name || "Unknown Item",
                price: oi.priceAtTime
              }))
            }));
            setOrders(mappedOrders);
            return;
          }
        } catch (err) {
          console.error("Backend fetch failed, falling back to local storage.", err);
        }
      }

      // Fallback
      let savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      let modified = false;
      savedOrders = savedOrders.map((order, idx) => {
        let needsSave = false;
        if (!order.id) {
          order.id = 1000 + idx;
          needsSave = true;
        }
        if (!order.status) {
          order.status = idx % 2 === 0 ? "Delivered" : "Processing";
          needsSave = true;
        }
        if (needsSave) modified = true;
        return order;
      });

      if (modified) localStorage.setItem("orders", JSON.stringify(savedOrders));
      setOrders(savedOrders);
    };

    fetchOrders();
  }, []);

  const handleReorder = (items) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const newCart = [...existingCart, ...items];
    localStorage.setItem("cart", JSON.stringify(newCart));
    alert("Medicines successfully re-added to your cart!");
  };

  const updateOrderStatus = (orderId, newStatus) => {
    // Show confirmation dialog before taking action
    if (newStatus === "Cancelled") {
      if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    }
    if (newStatus === "Return Requested") {
      if (!window.confirm("Do you want to initiate a return/refund request for this delivered order?")) return;
    }

    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    alert(`Order #${orderId} has been updated to: ${newStatus}`);
  };

  return (
    <div className="orders-container">
      <div className="orders-card">
        <h2>Order History</h2>
        <p>View your previous orders and reorder medicines easily.</p>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <p className="empty-msg">You have no past orders.</p>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-block">
                  <div className="order-header">
                    <h4>Order #{order.id}</h4>
                    <span className={`status ${order.status.toLowerCase().replace(" ", "-")}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-items-wrapper">
                    {order.items.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <span className="bullet">•</span>
                        <span className="order-item-text">{item.name}</span>
                        <span className="order-item-price">₹ {item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    Total: <span className="order-total-price">₹ {order.total}</span>
                    <div className="order-actions">
                      <button className="reorder-btn" onClick={() => handleReorder(order.items)}>
                        🔄 Reorder Medicines
                      </button>

                      {order.status === "Processing" && (
                        <button className="cancel-btn" onClick={() => updateOrderStatus(order.id, "Cancelled")}>
                          Cancel Order
                        </button>
                      )}
                      
                      {order.status === "Delivered" && (
                        <button className="return-btn" onClick={() => updateOrderStatus(order.id, "Return Requested")}>
                          Request Return/Refund
                        </button>
                      )}
                      
                      {order.status === "Cancelled" && (
                        <span className="action-note cancel-note">Order cancelled before dispatch.</span>
                      )}
                      
                      {order.status === "Return Requested" && (
                        <span className="action-note return-note">Return/Refund initiated. Pickup pending.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;


