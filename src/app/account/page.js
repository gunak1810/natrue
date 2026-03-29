'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/firestore';
import { User, Package, MapPin, Heart, LogOut, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import './account.css';

export default function AccountPage() {
  const { user, userProfile, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedOrder, setSelectedOrder] = useState(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      async function fetchUserOrders() {
        try {
          const ords = await getOrders({ userId: user.uid, limit: 10 });
          setOrders(ords);
        } catch (e) {
          console.error('Error fetching user orders:', e);
        } finally {
          setIsLoadingOrders(false);
        }
      }
      fetchUserOrders();
    }
  }, [user]);

  if (loading || !user) return <div className="loading-spinner"><div className="spinner" /></div>;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="account-page">
      <div className="container account-container">
        
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="account-user-info">
            <div className="user-avatar">{user.displayName?.[0] || '👤'}</div>
            <div>
              <h3>{userProfile?.name || user.displayName || 'Customer'}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <nav className="account-nav">
            <button className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><User size={18} /> My Profile</button>
            <button className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><Package size={18} /> Orders</button>
            <button className={`account-nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}><MapPin size={18} /> Addresses</button>
            <button className={`account-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}><Heart size={18} /> Wishlist</button>
            <button className="account-nav-item text-error" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>


        {/* Main Content */}
        <main className="account-main">
          {activeTab === 'profile' && (
            <>
              <h1 className="page-title">My Profile</h1>
              <div className="account-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3>Personal Information</h3>
                  <button className="btn btn-outline btn-sm">Edit</button>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{userProfile?.name || user.displayName || 'Not Set'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{userProfile?.phone || 'Not Set'}</span>
                  </div>
                </div>
              </div>
              
              <div className="account-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3>Recent Orders</h3>
                  <button className="text-primary btn-sm" onClick={() => setActiveTab('orders')}>View All</button>
                </div>
                {isLoadingOrders ? (
                  <div className="loading-spinner"><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                  <div className="account-empty" style={{ padding: '20px 0' }}>
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="account-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 3).map(order => (
                          <tr key={order.id}>
                            <td><strong>#{order.id.slice(0, 8)}</strong></td>
                            <td>₹{order.total}</td>
                            <td>
                              <span className={`status-badge status-${order.status || 'pending'}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => setSelectedOrder(order)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <h1 className="page-title">My Orders</h1>
              <div className="account-section">
                {isLoadingOrders ? (
                  <div className="loading-spinner"><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                  <div className="account-empty">
                    <Package size={48} />
                    <p>You haven&#39;t placed any orders yet.</p>
                    <Link href="/collections/all" className="btn btn-outline">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="account-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td><strong>#{order.id.slice(0, 8)}</strong></td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>₹{order.total}</td>
                            <td>
                              <span className={`status-badge status-${order.status || 'pending'}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => setSelectedOrder(order)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'addresses' && (
            <>
              <h1 className="page-title">Saved Addresses</h1>
              <div className="account-section">
                {!userProfile?.addresses || userProfile.addresses.length === 0 ? (
                  <div className="account-empty">
                    <MapPin size={48} />
                    <p>No addresses saved yet.</p>
                    <button className="btn btn-outline">Add New Address</button>
                  </div>
                ) : (
                  <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
                    {userProfile.addresses.map((addr, i) => (
                      <div key={i} className="address-card" style={{ padding: 20, border: '1px solid var(--color-border-light)', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 10 }}>{addr.name}</h4>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                          {addr.address}<br />
                          {addr.city}, {addr.state} - {addr.pincode}<br />
                          Phone: {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'wishlist' && (
            <>
              <h1 className="page-title">My Wishlist</h1>
              <div className="account-section">
                {!userProfile?.wishlist || userProfile.wishlist.length === 0 ? (
                  <div className="account-empty">
                    <Heart size={48} />
                    <p>Your wishlist is currently empty.</p>
                    <Link href="/collections/all" className="btn btn-outline">Go to Shop</Link>
                  </div>
                ) : (
                  <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {userProfile.wishlist.map((item, i) => (
                      <div key={i} className="address-card" style={{ padding: 15, border: '1px solid var(--color-border)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ width: '100%', height: 120, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                           {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎁'}
                        </div>
                        <h4 style={{ fontSize: '14px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                           {item.name || 'Product'}
                        </h4>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{item.price || item.salePrice || 0}</div>
                        <Link href={`/products/${item.slug || ''}`} className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 'auto' }}>View Product</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '16px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
              <span className={`status-badge status-${selectedOrder.status || 'pending'}`} style={{ fontSize: '12px' }}>
                 {selectedOrder.status || 'Pending'}
              </span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                <h4 style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Shipping Address</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  <strong>{selectedOrder.shippingAddress?.name || userProfile?.name}</strong><br />
                  {selectedOrder.shippingAddress?.address}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}<br />
                  Phone: {selectedOrder.shippingAddress?.phone}
                </p>
              </div>
              <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                <h4 style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Order Details</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  Date: {new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString()}<br />
                  Payment: {selectedOrder.paymentMethod?.toUpperCase() || 'COD'}<br />
                  Items: {selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ fontSize: '14px', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Product Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎁'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                      {item.variant && <div style={{ fontSize: '12px', color: '#6b7280' }}>Variant: {item.variant}</div>}
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #eee', marginTop: '15px' }}>
                <strong style={{ fontSize: '16px' }}>Total Amount</strong>
                <strong style={{ fontSize: '18px', color: 'var(--color-primary)' }}>₹{selectedOrder.total}</strong>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Shipping & Tracking</h4>
              <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e3a8a' }}>
                {selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? (
                  <>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Package is on the way!</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      <strong>Courier:</strong> {selectedOrder.trackingCourier || 'Standard Logistics'}<br/>
                      <strong>Tracking Number:</strong> {selectedOrder.trackingNumber || 'Tracking info will be emailed shortly'}
                    </p>
                  </>
                ) : selectedOrder.status === 'cancelled' ? (
                  <p style={{ margin: 0, color: '#991b1b', fontSize: '14px' }}>This order has been cancelled.</p>
                ) : (
                  <p style={{ margin: 0, fontSize: '14px' }}>We are currently preparing your order. Tracking details will be updated here once your package has been dispatched from our warehouse.</p>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: '25px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
