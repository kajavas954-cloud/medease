import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null); // { orderId }
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [hoverStar, setHoverStar] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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
            const mappedOrders = data.map(o => ({
              id: o.id,
              status: o.status,
              total: o.totalAmount,
              createdAt: o.createdAt,
              feedback: o.Feedback || null,
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

  // Split orders into present (active), previous (completed), and returns/cancellations
  const presentStatuses = ["Pending", "Processing", "Shipped"];
  const previousStatus = "Delivered";
  const returnStatuses = ["Cancelled", "Return Requested"];

  const presentOrders = orders.filter(o => presentStatuses.includes(o.status));
  const previousOrders = orders.filter(o => o.status === previousStatus);
  const returnOrders = orders.filter(o => returnStatuses.includes(o.status));

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

  const [showReasonModal, setShowReasonModal] = useState(null); // { id, type: 'cancel' | 'return' }
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const cancelOptions = [
    "Order placed by mistake",
    "Found a better price elsewhere",
    "Delivery time is too long",
    "Want to change payment method",
    "Want to change delivery address",
    "Others"
  ];

  const returnOptions = [
    "Damaged product received",
    "Wrong item delivered",
    "Product expired",
    "Poor quality / Not as described",
    "No longer needed",
    "Others"
  ];

  const handleActionClick = (orderId, type) => {
    setShowReasonModal({ id: orderId, type });
    setSelectedReason("");
    setOtherReason("");
  };

  const submitReasonAction = async () => {
    const { id, type } = showReasonModal;
    const finalReason = selectedReason === "Others" ? otherReason : selectedReason;
    
    if (!finalReason) {
      toast("Please select or type a reason", "error");
      return;
    }

    const token = localStorage.getItem("authToken");
    const endpoint = type === 'cancel' ? `cancel` : `return`;
    const statusLabel = type === 'cancel' ? 'Cancelled' : 'Return Requested';

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/${endpoint}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ reason: finalReason })
      });

      if (res.ok) {
        toast(`Order #${id} ${type === 'cancel' ? 'cancelled' : 'return requested'} successfully.`);
        const updatedOrders = orders.map(o => o.id === id ? { ...o, status: statusLabel } : o);
        setOrders(updatedOrders);
        setShowReasonModal(null);
      } else {
        const err = await res.json();
        toast(err.message || `Failed to ${type} order`, "error");
      }
    } catch (err) {
      toast(`Network error while ${type}ing order`, "error");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === "Return Requested") {
      const ok = await showConfirm("Do you want to initiate a return/refund request for this delivered order?");
      if (!ok) return;
    }

    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    toast(`Order #${orderId} updated to: ${newStatus}`);
  };

  const renderOrderCard = (order) => (
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

          {(order.status === "Pending" || order.status === "Processing") && (
            <button className="cancel-btn" onClick={() => handleActionClick(order.id, 'cancel')}>
              Cancel Order
            </button>
          )}

          {order.status === "Delivered" && (
            <button className="return-btn" onClick={() => handleActionClick(order.id, 'return')}>
              Request Return/Refund
            </button>
          )}

          {order.status === "Cancelled" && (
            <span className="action-note cancel-note">Order cancelled.</span>
          )}

          {order.status === "Return Requested" && (
            <span className="action-note return-note">Return/Refund initiated. Pickup pending.</span>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      {order.status === "Delivered" && (
        order.feedback ? (
          <div className="feedback-submitted-card">
            <div className="feedback-submitted-stars">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={s <= order.feedback.rating ? 'star filled' : 'star'}>★</span>
              ))}
            </div>
            <p className="feedback-submitted-comment">{order.feedback.comment || <em>No comment added.</em>}</p>
            <span className="feedback-submitted-label">✅ Feedback submitted</span>
          </div>
        ) : (
          <button
            className="feedback-btn"
            onClick={() => {
              setFeedbackForm({ rating: 0, comment: '' });
              setHoverStar(0);
              setFeedbackModal({ orderId: order.id });
            }}
          >
            ⭐ Leave Feedback
          </button>
        )
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="orders-dashboard">
      <div className="orders-panel">
        <div className="panel-header present-header">
          <span className="panel-icon">📦</span>
          <div className="panel-title-group">
            <h3>Present Orders</h3>
            <span className="panel-subtitle">Active and In-Progress</span>
          </div>
          <span className="panel-count present-count">{presentOrders.length}</span>
        </div>
        <div className="panel-body">
          {presentOrders.length > 0 ? (
            presentOrders.map(renderOrderCard)
          ) : (
            <div className="empty-state">No active orders.</div>
          )}
        </div>
      </div>

      <div className="orders-panel">
        <div className="panel-header previous-header">
          <span className="panel-icon">✅</span>
          <div className="panel-title-group">
            <h3>Previous Orders</h3>
            <span className="panel-subtitle">Successfully Delivered</span>
          </div>
          <span className="panel-count previous-count">{previousOrders.length}</span>
        </div>
        <div className="panel-body">
          {previousOrders.length > 0 ? (
            previousOrders.map(renderOrderCard)
          ) : (
            <div className="empty-state">No delivered orders yet.</div>
          )}
        </div>
      </div>

      <div className="orders-panel">
        <div className="panel-header return-header">
          <span className="panel-icon">🔄</span>
          <div className="panel-title-group">
            <h3>Returns & Cancellations</h3>
            <span className="panel-subtitle">Refunds and cancelled items</span>
          </div>
          <span className="panel-count return-count">{returnOrders.length}</span>
        </div>
        <div className="panel-body">
          {returnOrders.length > 0 ? (
            returnOrders.map(renderOrderCard)
          ) : (
            <div className="empty-state">No returns or cancellations.</div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999, padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', padding: '36px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxWidth: '460px', width: '100%',
            position: 'relative', animation: 'modalFadeIn 0.3s ease'
          }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Rate Your Order #{feedbackModal.orderId}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              How was your experience? Your feedback helps us improve.
            </p>

            {/* Star Picker */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`feedback-star${star <= (hoverStar || feedbackForm.rating) ? ' active' : ''}`}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                >
                  ★
                </span>
              ))}
            </div>

            {feedbackForm.rating > 0 && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '-18px', marginBottom: '16px' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][feedbackForm.rating]} — {feedbackForm.rating}/5
              </p>
            )}

            {/* Comment */}
            <textarea
              placeholder="Share your experience (optional)..."
              value={feedbackForm.comment}
              onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px',
                resize: 'none', height: '100px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '22px',
                fontFamily: 'inherit', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#1abc9c'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setFeedbackModal(null)}
                style={{
                  flex: 1, padding: '13px', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                }}
              >Cancel</button>
              <button
                disabled={feedbackForm.rating === 0 || submittingFeedback}
                onClick={async () => {
                  if (feedbackForm.rating === 0) { toast('Please select a star rating', 'error'); return; }
                  setSubmittingFeedback(true);
                  const token = localStorage.getItem('authToken');
                  try {
                    const res = await fetch(`http://localhost:5000/api/orders/${feedbackModal.orderId}/feedback`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                      body: JSON.stringify(feedbackForm)
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setOrders(prev => prev.map(o =>
                        o.id === feedbackModal.orderId
                          ? { ...o, feedback: { rating: feedbackForm.rating, comment: feedbackForm.comment } }
                          : o
                      ));
                      toast('Thank you for your feedback! ⭐');
                      setFeedbackModal(null);
                    } else {
                      toast(data.message || 'Failed to submit feedback', 'error');
                    }
                  } catch {
                    toast('Network error. Please try again.', 'error');
                  } finally {
                    setSubmittingFeedback(false);
                  }
                }}
                style={{
                  flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
                  background: feedbackForm.rating === 0 ? '#bdc3c7' : 'linear-gradient(135deg, #1abc9c, #16a085)',
                  color: '#fff', fontWeight: 700, cursor: feedbackForm.rating === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px', boxShadow: feedbackForm.rating > 0 ? '0 4px 14px rgba(26,188,156,0.35)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >{submittingFeedback ? 'Submitting...' : 'Submit Feedback'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Reason Modal (Unified for Cancel & Return) */}
      {showReasonModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 99999, padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '450px', width: '100%',
            position: 'relative', animation: 'modalFadeIn 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
              {showReasonModal.type === 'cancel' ? 'Cancel' : 'Return Request'} Order #{showReasonModal.id}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              {showReasonModal.type === 'cancel' 
                ? "We're sorry to see you cancel. Please let us know the reason:"
                : "Please tell us why you'd like to return this order:"}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(showReasonModal.type === 'cancel' ? cancelOptions : returnOptions).map((opt, idx) => (
                <label key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
                  borderRadius: '10px', border: `1.5px solid ${selectedReason === opt ? '#1abc9c' : '#e2e8f0'}`,
                  background: selectedReason === opt ? '#f0fdfa' : '#fff', cursor: 'pointer',
                  transition: 'all 0.2s ease', fontSize: '14px', fontWeight: 500, color: '#334155'
                }}>
                  <input 
                    type="radio" 
                    name="reason" 
                    value={opt} 
                    checked={selectedReason === opt}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ accentColor: '#1abc9c' }}
                  />
                  {opt}
                </label>
              ))}
            </div>

            {selectedReason === "Others" && (
              <textarea
                placeholder="Please describe your reason..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  fontSize: '14px', marginBottom: '20px', resize: 'none', height: '80px',
                  outline: 'none', focus: { borderColor: '#1abc9c' }
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowReasonModal(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer'
                }}
              >Back</button>
              <button
                onClick={submitReasonAction}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: showReasonModal.type === 'cancel' ? '#ef4444' : '#1abc9c', 
                  color: '#fff', fontWeight: 700, cursor: 'pointer',
                  boxShadow: `0 4px 12px ${showReasonModal.type === 'cancel' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(26, 188, 156, 0.2)'}`
                }}
              >Confirm {showReasonModal.type === 'cancel' ? 'Cancellation' : 'Return'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="orders-container">
      <div className="orders-page-header">
        <h2>📋 Order History</h2>
        <p>Track your active orders, browse your purchase history, and see your returns/cancellations.</p>
      </div>

      {renderDashboard()}

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
