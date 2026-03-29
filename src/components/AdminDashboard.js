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
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }
  const toast = useToast();
  const confirmResolveRef = useRef(null);
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ id: null, name: '', category: '', price: '', imageUrl: '', description: '', requiresPrescription: false, uses: '', warning: '', limit: '', expiry: '', beforeUse: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
      return;
    }
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
        if (res.ok) {
           const allMeds = await res.json();
           setData(allMeds.filter(m => !m.requiresPrescription));
        }
      } else if (activeTab === 'Prescriptions') {
        const res = await fetch('http://localhost:5000/api/admin/medicines', { headers });
        if (res.ok) {
           const allMeds = await res.json();
           setData(allMeds.filter(m => m.requiresPrescription));
        }
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
    setConfirmDialog({ message, onConfirm: () => { resolve(true); setConfirmDialog(null); }, onCancel: () => { resolve(false); setConfirmDialog(null); } });
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
      setProductForm({ 
        id: null, name: '', category: '', price: '', imageUrl: '', description: '', uses: '', warning: '', limit: '', expiry: '', beforeUse: '',
        requiresPrescription: activeTab === 'Prescriptions' 
      });
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

    if (res.ok) {
      toast('Product deleted!');
      fetchData();
    }
  };

  // --- Order Actions ---
  const handleOrderStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      toast('Order status updated!');
      fetchData();
    }
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

  const renderMeds = (isPrescription) => (
    <div className="admin-table-container">
      <div className="admin-action-bar">
        <h2 className="mb-0">{isPrescription ? 'Manage Prescriptions' : 'Manage Products'}</h2>
        <button className="admin-btn" onClick={() => handleOpenProductModal()}>+ Add {isPrescription ? 'Prescription' : 'Product'}</button>
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
              <td>${parseFloat(p.price).toFixed(2)}</td>
              <td>
                <button className="admin-btn-action btn-edit" onClick={() => handleOpenProductModal(p)}>Edit</button>
                <button className="admin-btn-action btn-delete" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No items found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-table-container">
      <div className="admin-action-bar">
        <h2 className="mb-0">Manage Orders</h2>
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
          {data.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.User?.name || 'Guest'}</td>
              <td>${parseFloat(o.totalAmount).toFixed(2)}</td>
              <td>
                {new Date(o.createdAt).toLocaleDateString()}
                {o.OrderItems && o.OrderItems.some(i => i.prescriptionUrl) && (
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#1abc9c', fontWeight: 'bold' }}>
                    <span onClick={() => toast('Prescription URL: ' + o.OrderItems.find(i => i.prescriptionUrl).prescriptionUrl, 'info')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      📄 View Rx
                    </span>
                  </div>
                )}
              </td>
              <td>
                <select 
                  className="status-dropdown" 
                  value={o.status || 'Pending'}
                  onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
            </tr>
          ))}
          {data.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No orders found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

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
              <td><div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message}</div></td>
              <td><span style={{ color: t.status === 'Resolved' ? '#1abc9c' : '#f39c12', fontWeight: 'bold' }}>{t.status}</span></td>
              <td>
                {t.status === 'Open' && <button className="admin-btn-action btn-edit" onClick={() => handleResolveTicket(t.id)}>Resolve</button>}
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
          {['Overview', 'Products', 'Prescriptions', 'Orders', 'Users', 'Support Tickets'].map(tab => (
            <li 
              key={tab} 
              className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
        <div className="admin-logout-item" onClick={handleLogout}>
          Logout
        </div>
      </aside>

      <main className="admin-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="mb-0" style={{ marginTop: 0 }}>{activeTab}</h1>
          {loading && <span style={{ color: '#1abc9c', fontWeight: 600 }}>Updating...</span>}
        </div>
        
        <div>
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Products' && renderMeds(false)}
          {activeTab === 'Prescriptions' && renderMeds(true)}
          {activeTab === 'Orders' && renderOrders()}
          {activeTab === 'Users' && renderUsers()}
          {activeTab === 'Support Tickets' && renderSupportTickets()}
        </div>
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{productForm.id ? 'Edit Product' : 'Add New Product'}</h3>
            <form className="admin-modal-form" onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input required type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} placeholder="/images/medicine/default.png" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label>Uses</label>
                <textarea rows="2" value={productForm.uses || ''} onChange={e => setProductForm({...productForm, uses: e.target.value})} placeholder="What is this medicine used for?"></textarea>
              </div>
              <div className="form-group">
                <label>Warning</label>
                <textarea rows="2" value={productForm.warning || ''} onChange={e => setProductForm({...productForm, warning: e.target.value})} placeholder="Any side effects or warnings?"></textarea>
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Limit (Dosage)</label>
                  <input type="text" value={productForm.limit || ''} onChange={e => setProductForm({...productForm, limit: e.target.value})} placeholder="e.g. 1 Tablet daily" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Expiry Date</label>
                  <input type="text" value={productForm.expiry || ''} onChange={e => setProductForm({...productForm, expiry: e.target.value})} placeholder="e.g. 24 Months" />
                </div>
              </div>
              <div className="form-group">
                <label>Best Before Use</label>
                <input type="text" value={productForm.beforeUse || ''} onChange={e => setProductForm({...productForm, beforeUse: e.target.value})} placeholder="e.g. Store in a cool dry place" />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '15px' }}>
                <input type="checkbox" id="prescCheck" checked={productForm.requiresPrescription} onChange={e => setProductForm({...productForm, requiresPrescription: e.target.checked})} style={{ width: 'auto', margin: 0 }} />
                <label htmlFor="prescCheck" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>Prescription Required</label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn btn-cancel" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
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
