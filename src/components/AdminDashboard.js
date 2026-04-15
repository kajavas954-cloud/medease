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
    const finalOrders = data.filter(o => ['Cancelled', 'Return Requested'].includes(o.status));

    const renderOrderTable = (orders, title) => (
      <div className="admin-table-container" style={{ marginBottom: '30px' }}>
        <div className="admin-action-bar">
          <h2 className="mb-0">{title}</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const isFinal = o.status === 'Cancelled' || o.status === 'Return Requested';
              return (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.User?.name || 'Guest'}</td>
                  <td>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    {isFinal ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="order-status-badge" style={{ background: orderStatusColor(o.status) }}>
                          {o.status}
                        </span>
                        {o.cancelReason && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', maxWidth: '150px' }}>
                            Cancel Reason: {o.cancelReason}
                          </div>
                        )}
                        {o.returnReason && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', maxWidth: '150px' }}>
                            Return Reason: {o.returnReason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <select
                        className="status-dropdown"
                        value={o.status || 'Pending'}
                        onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return Requested">Return Requested</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    );

    return (
      <div>
        {renderOrderTable(activeOrders, 'Active Orders')}
        {renderOrderTable(finalOrders, 'Returns & Cancellations')}
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

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">MedEase Admin</div>
        <ul className="admin-nav-list">
          {['Overview', 'Products', 'Orders', 'Users', 'Support Tickets'].map(tab => (
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
