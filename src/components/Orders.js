import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

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
    window.dispatchEvent(new Event('cartUpdated'));
    toast("Medicines re-added to your cart!");
  };

  const showConfirm = (message) => new Promise(resolve => {
    setConfirmDialog({
      message,
      onConfirm: () => { resolve(true); setConfirmDialog(null); },
      onCancel: () => { resolve(false); setConfirmDialog(null); }
    });
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === "Cancelled") {
      const ok = await showConfirm("Are you sure you want to cancel this order? This action cannot be undone.");
      if (!ok) return;
    }
    if (newStatus === "Return Requested") {
      const ok = await showConfirm("Do you want to initiate a return/refund request for this delivered order?");
      if (!ok) return;
    }

    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    toast(`Order #${orderId} updated to: ${newStatus}`);
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

      {/* Custom Confirm Dialog */}
      {confirmDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998
        }}>
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '32px 36px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)', maxWidth: '400px', width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '24px', color: '#444' }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmDialog.onCancel}
                style={{ padding: '10px 26px', borderRadius: '8px', border: '1.5px solid #ccc', background: '#fff', color: '#555', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >Cancel</button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{ padding: '10px 26px', borderRadius: '8px', border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;


