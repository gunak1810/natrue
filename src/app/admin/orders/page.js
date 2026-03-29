'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import { Eye, Edit2 } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const ords = await getOrders({});
      setOrders(ords);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update status.');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>All Orders</h3>
      </div>
      <div className="table-responsive">
        {orders.length === 0 ? (
          <div className="admin-empty">No orders found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>#{order.id.slice(0, 8)}</strong></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div>
                      <div>{order.shippingAddress?.name || 'Guest'}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{order.userEmail}</div>
                    </div>
                  </td>
                  <td><strong>₹{order.total}</strong></td>
                  <td><span style={{ fontSize: '12px', textTransform: 'uppercase' }}>{order.paymentMethod || 'COD'}</span></td>
                  <td>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`status-select status-${order.status || 'pending'}`}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn-edit" onClick={() => setSelectedOrder(order)} title="View Details"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', background: '#fff', padding: '30px', borderRadius: '12px', position: 'relative' }}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '15px', right: '15px' }}><Eye size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>Order Details #{selectedOrder.id.slice(0, 8)}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Shipping Address</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>{selectedOrder.shippingAddress.name}</strong><br />
                  {selectedOrder.shippingAddress.address}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}<br />
                  Phone: {selectedOrder.shippingAddress.phone}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Order Info</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Date: {new Date(selectedOrder.createdAt).toLocaleString()}<br />
                  Payment: {selectedOrder.paymentMethod?.toUpperCase() || 'COD'}<br />
                  Status: <strong>{selectedOrder.status?.toUpperCase() || 'PENDING'}</strong>
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Items</h4>
            <div style={{ border: '1px solid #eee', borderRadius: '8px' }}>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none' }}>
                  <span>{item.name} x {item.quantity}</span>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f9f9f9', borderTop: '2px solid #eee' }}>
                <strong>Total Amount</strong>
                <strong style={{ fontSize: '18px', color: 'var(--color-primary)' }}>₹{selectedOrder.total}</strong>
              </div>
            </div>
            
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)} style={{ flex: 1 }}>Close</button>
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <button className="btn btn-outline text-error" onClick={() => { handleStatusChange(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }} style={{ flex: 1 }}>Cancel Order</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
