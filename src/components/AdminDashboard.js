import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';
import './AdminDashboard.css';

const ImageWithFallback = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <img
      src={hasError || !src ? "https://via.placeholder.com/50" : src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toast = useToast();
  const confirmResolveRef = useRef(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderTab, setOrderTab] = useState('active'); // Orders tab switcher

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null, name: '', category: '', price: '', imageUrl: '',
    uses: '', warning: '', limit: '', expiry: '', beforeUse: ''
  });

  // Ticket view modal
  const [viewTicket, setViewTicket] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/'); return; }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'Overview') {
        const res = await fetch('http://localhost:5000/api/admin/stats', { headers });
        if (res.ok) setStats(await res.json());
      } else if (activeTab === 'Products') {
        const res = await fetch('http://localhost:5000/api/admin/medicines', { headers });
        if (res.ok) setData(await res.json());
      } else if (activeTab === 'Orders') {
        const res = await fetch('http://localhost:5000/api/admin/orders', { headers });
        if (res.ok) setData(await res.json());
      } else if (activeTab === 'Users') {
        const res = await fetch('http://localhost:5000/api/admin/users', { headers });
        if (res.ok) setData(await res.json());
      } else if (activeTab === 'Support Tickets') {
        const res = await fetch('http://localhost:5000/api/admin/tickets', { headers });
        if (res.ok) setData(await res.json());
      } else if (activeTab === 'Feedback Reviews') {
        const res = await fetch('http://localhost:5000/api/admin/feedback', { headers });
        if (res.ok) setData(await res.json());
      } else if (activeTab === 'Appointments') {
        const res = await fetch('http://localhost:5000/api/admin/appointments', { headers });
        if (res.ok) setData(await res.json());
      }
    } catch (err) {
      toast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showConfirm = (message) => new Promise(resolve => {
    setConfirmDialog({
      message,
      onConfirm: () => { resolve(true); setConfirmDialog(null); },
      onCancel: () => { resolve(false); setConfirmDialog(null); }
    });
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // --- Product Actions ---
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setProductForm({ ...product });
    } else {
      setProductForm({ id: null, name: '', category: '', price: '', imageUrl: '', uses: '', warning: '', limit: '', expiry: '', beforeUse: '' });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = productForm.id
      ? `http://localhost:5000/api/admin/medicines/${productForm.id}`
      : `http://localhost:5000/api/admin/medicines`;
    const method = productForm.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(productForm)
    });

    if (res.ok) {
      toast(productForm.id ? 'Product updated!' : 'Product added!');
      setShowProductModal(false);
      fetchData();
    } else {
      toast('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    const ok = await showConfirm('Are you sure you want to delete this product?');
    if (!ok) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`http://localhost:5000/api/admin/medicines/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { toast('Product deleted!'); fetchData(); }
  };

  // --- Order Actions ---
  const handleOrderStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) { toast('Order status updated!'); fetchData(); }
  };

  // --- Ticket Actions ---
  const handleResolveTicket = async (id) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`http://localhost:5000/api/admin/tickets/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { toast('Ticket resolved!'); fetchData(); }
  };

  const handleDeleteTicket = async (id) => {
    const ok = await showConfirm('Are you sure you want to delete this ticket?');
    if (!ok) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`http://localhost:5000/api/admin/tickets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { toast('Ticket deleted!'); fetchData(); }
  };

  // Helper: status badge colour
  const orderStatusColor = (status) => {
    const map = {
      'Pending': '#f39c12',
      'Processing': '#3498db',
      'Shipped': '#8e44ad',
      'Delivered': '#27ae60',
      'Cancelled': '#e74c3c',
      'Return Requested': '#9b59b6'
    };
    return map[status] || '#7f8c8d';
  };

  // --- Renderers ---
  const renderOverview = () => (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <div className="admin-stat-title">Total Products</div>
        <div className="admin-stat-value">{stats.totalProducts}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-title">Total Orders</div>
        <div className="admin-stat-value">{stats.totalOrders}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-title">Total Users</div>
        <div className="admin-stat-value">{stats.totalUsers}</div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="admin-table-container">
      <div className="admin-action-bar">
        <h2 className="mb-0">Manage Products</h2>
        <button className="admin-btn" onClick={() => handleOpenProductModal()}>+ Add Product</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.id}>
              <td><ImageWithFallback src={p.imageUrl} alt={p.name} className="product-image-preview" /></td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>₹{parseFloat(p.price).toFixed(2)}</td>
              <td>
                <button className="admin-btn-action btn-edit" onClick={() => handleOpenProductModal(p)}>Edit</button>
                <button className="admin-btn-action btn-delete" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No products found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderOrders = () => {
    const activeOrders = data.filter(o => !['Cancelled', 'Return Requested'].includes(o.status));
    const finalOrders  = data.filter(o =>  ['Cancelled', 'Return Requested'].includes(o.status));

    const paymentIcon = (m) => {
      const v = (m || 'card').toLowerCase();
      if (v === 'upi')        return '📱 UPI';
      if (v === 'netbanking') return '🏦 Net Banking';
      return '💳 Card';
    };
    const paymentColor = (m) => {
      const v = (m || 'card').toLowerCase();
      if (v === 'upi')        return { bg: '#ede9fe', color: '#7c3aed' };
      if (v === 'netbanking') return { bg: '#dbeafe', color: '#1d4ed8' };
      return { bg: '#dcfce7', color: '#15803d' };
    };
    const parseAddress = (raw) => {
      try { const a = JSON.parse(raw); if (a && a.street) return a; } catch (e) {}
      return null;
    };

    const renderOrderCard = (o) => {
      const isFinal = ['Cancelled', 'Return Requested'].includes(o.status);
      const pc   = paymentColor(o.paymentMethod);
      const addr = parseAddress(o.address);
      return (
        <div key={o.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>Order #{o.id}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>📅 {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                👤 {o.User?.name || 'Guest'}
                {o.User?.email && <span style={{ fontWeight: 400, color: '#94a3b8' }}> · {o.User.email}</span>}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>₹{parseFloat(o.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Info strips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ padding: '14px 20px', borderRight: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>📍 Delivery Address</div>
              {addr ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[['Street', addr.street], ['City', addr.city], ['State', addr.state], ['Pin', addr.postalCode]].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, minWidth: '44px', flexShrink: 0 }}>{label}:</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#1e293b' }}>{o.address || '—'}</div>
              )}
            </div>
            <div style={{ padding: '14px 20px', borderRight: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>🕐 Delivery Slot</div>
              <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, marginBottom: '14px' }}>{o.deliveryTimeSlot || '—'}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>💰 Payment Method</div>
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: pc.bg, color: pc.color }}>{paymentIcon(o.paymentMethod)}</span>
            </div>
            <div style={{ padding: '14px 20px', borderRight: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>📦 Delivery Status</div>
              <span className="order-status-badge" style={{
                background: orderStatusColor(o.status),
                display: 'inline-block', padding: '5px 14px', borderRadius: '20px',
                fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '10px'
              }}>
                {o.status || 'Pending'}
              </span>
              {!isFinal && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Update Status</div>
                  <select
                    className="status-dropdown"
                    value={o.status || 'Pending'}
                    onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Return Requested">Return Requested</option>
                  </select>
                </div>
              )}
            </div>
            {(o.cancelReason || o.returnReason) && (
              <div style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>⚠️ Reason</div>
                <div style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>{o.cancelReason || o.returnReason}</div>
              </div>
            )}
          </div>

          {/* Items Table */}
          {o.OrderItems && o.OrderItems.length > 0 && (
            <div>
              <div style={{ padding: '10px 20px 4px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                🛍️ Items Ordered ({o.OrderItems.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                    {['#', 'Product Name', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                      <th key={h} style={{ padding: '7px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {o.OrderItems.map((item, idx) => (
                    <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={{ padding: '9px 16px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '9px 16px', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{item.Medicine?.name || 'Item #' + item.medicineId}</td>
                      <td style={{ padding: '9px 16px' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>x{item.quantity}</span>
                      </td>
                      <td style={{ padding: '9px 16px', fontSize: '13px', color: '#475569' }}>₹{parseFloat(item.priceAtTime).toFixed(2)}</td>
                      <td style={{ padding: '9px 16px', fontSize: '13px', color: '#15803d', fontWeight: 700 }}>₹{(item.quantity * parseFloat(item.priceAtTime)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
                    <td colSpan="4" style={{ padding: '9px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Order Total</td>
                    <td style={{ padding: '9px 16px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      );
    };

    const shownOrders = orderTab === 'active' ? activeOrders : finalOrders;

    return (
      <div>
        {/* ── Tab Switcher ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '24px', background: '#f1f5f9',
          padding: '5px', borderRadius: '14px', width: 'fit-content'
        }}>
          {[
            { key: 'active',    label: '📦 Active Orders',        count: activeOrders.length,  activeColor: '#1abc9c' },
            { key: 'cancelled', label: '❌ Cancelled & Returns', count: finalOrders.length,   activeColor: '#ef4444' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setOrderTab(tab.key)}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: 'inherit',
                transition: 'all 0.18s',
                background: orderTab === tab.key ? '#fff' : 'transparent',
                color:      orderTab === tab.key ? tab.activeColor : '#64748b',
                boxShadow:  orderTab === tab.key ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '22px', height: '22px', borderRadius: '20px', padding: '0 6px',
                fontSize: '11px', fontWeight: 800,
                background: orderTab === tab.key ? tab.activeColor : '#e2e8f0',
                color:      orderTab === tab.key ? '#fff' : '#64748b',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── Orders List ── */}
        {shownOrders.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
            {orderTab === 'active' ? 'No active orders.' : 'No cancelled or returned orders.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {shownOrders.map(o => renderOrderCard(o))}
          </div>
        )}
      </div>
    );
  };


  const renderUsers = () => (
    <div className="admin-table-container">
      <div className="admin-action-bar">
        <h2 className="mb-0">Registered Users</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Registered Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone || 'N/A'}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {data.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No users found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderSupportTickets = () => (
    <div className="admin-table-container">
      <div className="admin-action-bar">
        <h2 className="mb-0">Support Tickets</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.email}</td>
              <td>
                <div className="ticket-message-cell">
                  <span className="ticket-message-preview">{t.message}</span>
                </div>
              </td>
              <td>
                <span style={{ color: t.status === 'Resolved' ? '#1abc9c' : '#f39c12', fontWeight: 'bold' }}>
                  {t.status}
                </span>
              </td>
              <td>
                <button className="admin-btn-action btn-view" onClick={() => setViewTicket(t)}>View</button>
                {t.status === 'Open' && (
                  <button className="admin-btn-action btn-edit" onClick={() => handleResolveTicket(t.id)}>Resolve</button>
                )}
                <button className="admin-btn-action btn-delete" onClick={() => handleDeleteTicket(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No tickets found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderFeedback = () => (
    <div className="admin-table-container">
      <div className="admin-action-bar">
        <h2 className="mb-0">⭐ Customer Feedback Reviews</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Order #</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(fb => (
            <tr key={fb.id}>
              <td style={{ fontWeight: 600 }}>{fb.User?.name || 'Unknown'}</td>
              <td style={{ color: '#64748b', fontSize: '13px' }}>{fb.User?.email || '—'}</td>
              <td>
                <span style={{
                  background: '#e0f2fe', color: '#0277bd',
                  padding: '3px 10px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: 700
                }}>#{fb.Order?.id || fb.orderId}</span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '1px' }}>
                    {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                  </span>
                  <span style={{
                    background: fb.rating >= 4 ? '#dcfce7' : fb.rating === 3 ? '#fef9c3' : '#fee2e2',
                    color: fb.rating >= 4 ? '#15803d' : fb.rating === 3 ? '#92400e' : '#b91c1c',
                    padding: '2px 8px', borderRadius: '10px',
                    fontSize: '11px', fontWeight: 700
                  }}>{fb.rating}/5</span>
                </div>
              </td>
              <td style={{ maxWidth: '240px' }}>
                <span style={{
                  display: 'block', fontSize: '13px',
                  fontStyle: fb.comment ? 'normal' : 'italic',
                  color: fb.comment ? '#e2e8f0' : '#64748b'
                }}>
                  {fb.comment || 'No comment provided.'}
                </span>
              </td>
              <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                {new Date(fb.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </td>
            </tr>
          ))}
          {data.length === 0 && !loading && (
            <tr>
              <td colSpan="6" className="text-center" style={{ color: '#94a3b8', fontSize: '14px', padding: '30px' }}>
                No feedback reviews yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const apptStatusColor = (s) => {
    if (s === 'Confirmed') return '#0d9488';
    if (s === 'Cancelled') return '#dc2626';
    return '#b45309';
  };

  const renderAppointments = () => {
    const handleApptStatus = async (id, status) => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status })
        });
        if (res.ok) {
          setData(prev => prev.map(a => a.id === id ? { ...a, status } : a));
          toast(`Appointment ${status}`);
        }
      } catch (e) { toast('Update failed', 'error'); }
    };

    return (
      <div>
        <div className="admin-action-bar" style={{ marginBottom: '20px' }}>
          <h2 className="mb-0">
            All Appointments{' '}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>({data.length})</span>
          </h2>
        </div>
        {data.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            No appointments booked yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.map(a => (
              <div key={a.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Patient</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{a.User?.name || 'Guest'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{a.User?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Service</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{a.service}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Hospital</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{a.hospitalName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {a.hospitalCity}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date &amp; Time</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    {new Date(a.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>🕐 {a.appointmentTime}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Status</div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: a.status === 'Confirmed' ? 'rgba(13,148,136,0.15)' : a.status === 'Cancelled' ? 'rgba(220,38,38,0.15)' : 'rgba(180,83,9,0.15)', color: apptStatusColor(a.status), marginBottom: '8px' }}>
                    {a.status}
                  </span>
                  {a.status !== 'Cancelled' && (
                    <select
                      className="status-dropdown"
                      value={a.status}
                      onChange={e => handleApptStatus(a.id, e.target.value)}
                      style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">MedEase Admin</div>
        <ul className="admin-nav-list">
          {['Overview', 'Products', 'Orders', 'Users', 'Support Tickets', 'Feedback Reviews', 'Appointments'].map(tab => (
            <li
              key={tab}
              className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
        <div className="admin-logout-item" onClick={handleLogout}>Logout</div>
      </aside>

      <main className="admin-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="mb-0" style={{ marginTop: 0 }}>{activeTab}</h1>
          {loading && <span style={{ color: '#1abc9c', fontWeight: 600 }}>Updating...</span>}
        </div>

        <div>
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Products' && renderProducts()}
          {activeTab === 'Orders' && renderOrders()}
          {activeTab === 'Users' && renderUsers()}
          {activeTab === 'Support Tickets' && renderSupportTickets()}
          {activeTab === 'Feedback Reviews' && renderFeedback()}
          {activeTab === 'Appointments' && renderAppointments()}
        </div>
      </main>

      {/* ── Product Modal (glass, fits on screen) ── */}
      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal admin-modal-glass" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{productForm.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin-modal-close" onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <div className="admin-modal-scroll-body">
              <form className="admin-modal-form" onSubmit={handleSaveProduct}>
                <div className="admin-modal-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input required type="text" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" value={productForm.expiry || ''} onChange={e => setProductForm({ ...productForm, expiry: e.target.value })} placeholder="e.g. Dec 2026" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input type="text" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} placeholder="/images/medicine/default.png" />
                </div>
                <div className="form-group">
                  <label>Uses</label>
                  <textarea rows="2" value={productForm.uses || ''} onChange={e => setProductForm({ ...productForm, uses: e.target.value })} placeholder="What is this medicine used for?" />
                </div>
                <div className="form-group">
                  <label>Warning</label>
                  <textarea rows="2" value={productForm.warning || ''} onChange={e => setProductForm({ ...productForm, warning: e.target.value })} placeholder="Any side effects or warnings?" />
                </div>
                <div className="form-group">
                  <label>Dosage Limit</label>
                  <input type="text" value={productForm.limit || ''} onChange={e => setProductForm({ ...productForm, limit: e.target.value })} placeholder="e.g. 1 Tablet daily" />
                </div>
                <div className="form-group">
                  <label>Best Before Use</label>
                  <input type="text" value={productForm.beforeUse || ''} onChange={e => setProductForm({ ...productForm, beforeUse: e.target.value })} placeholder="e.g. Store in a cool dry place" />
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="admin-btn btn-cancel" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" className="admin-btn">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Ticket View Modal ── */}
      {viewTicket && (
        <div className="admin-modal-overlay" onClick={() => setViewTicket(null)}>
          <div className="admin-modal admin-modal-glass" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Support Ticket</h3>
              <button className="admin-modal-close" onClick={() => setViewTicket(null)}>✕</button>
            </div>
            <div className="admin-modal-scroll-body">
              <div className="ticket-view-row">
                <span className="ticket-view-label">User</span>
                <span className="ticket-view-value">{viewTicket.name}</span>
              </div>
              <div className="ticket-view-row">
                <span className="ticket-view-label">Email</span>
                <span className="ticket-view-value">{viewTicket.email}</span>
              </div>
              <div className="ticket-view-row">
                <span className="ticket-view-label">Status</span>
                <span className="ticket-view-value" style={{ color: viewTicket.status === 'Resolved' ? '#1abc9c' : '#f39c12', fontWeight: 700 }}>
                  {viewTicket.status}
                </span>
              </div>
              <div className="ticket-view-row">
                <span className="ticket-view-label">Date</span>
                <span className="ticket-view-value">
                  {viewTicket.createdAt ? new Date(viewTicket.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="ticket-view-message-box">
                <span className="ticket-view-label">Message</span>
                <p className="ticket-view-message">{viewTicket.message}</p>
              </div>
              <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
                {viewTicket.status === 'Open' && (
                  <button className="admin-btn" onClick={() => { handleResolveTicket(viewTicket.id); setViewTicket(null); }}>
                    ✓ Mark Resolved
                  </button>
                )}
                <button className="admin-btn btn-cancel" onClick={() => setViewTicket(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Dialog ── */}
      {confirmDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998
        }}>
          <div style={{
            background: '#1e2a38', borderRadius: '14px', padding: '32px 36px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.5)', maxWidth: '420px', width: '90%',
            textAlign: 'center', color: '#fff'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '28px', color: '#cdd5df' }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button
                onClick={confirmDialog.onCancel}
                style={{ padding: '10px 28px', borderRadius: '8px', border: '1.5px solid #445566', background: 'transparent', color: '#aab', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >Cancel</button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
