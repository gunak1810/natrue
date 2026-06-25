'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/firestore';
import { User, Package, MapPin, Heart, LogOut, Search, Clock, CreditCard, ChevronRight, Settings, Sprout, Leaf } from 'lucide-react';
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

  const displayName = userProfile?.name || user.displayName || 'Customer';
  const initial = displayName[0]?.toUpperCase() || 'C';
  const wishlistCount = userProfile?.wishlist?.length || 0;
  const addressesCount = userProfile?.addresses?.length || 0;
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  return (
    <div className="account-page">
      <div className="dashboard-container">
        
        {/* Left Vertical Sidebar */}
        <nav className="sidebar">
            <div className="nav-items">
                <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} title="My Profile">
                    {activeTab === 'profile' && <span className="active-indicator"></span>}
                    <User size={20} />
                    {activeTab === 'profile' && <span className="nav-label">PROFILE</span>}
                </button>
                <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} title="My Orders">
                    {activeTab === 'orders' && <span className="active-indicator"></span>}
                    <Package size={20} />
                    {activeTab === 'orders' && <span className="nav-label">ORDERS</span>}
                </button>
                <button className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')} title="Saved Addresses">
                    {activeTab === 'addresses' && <span className="active-indicator"></span>}
                    <MapPin size={20} />
                    {activeTab === 'addresses' && <span className="nav-label">ADDRESSES</span>}
                </button>
                <button className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')} title="My Wishlist">
                    {activeTab === 'wishlist' && <span className="active-indicator"></span>}
                    <Heart size={20} />
                    {activeTab === 'wishlist' && <span className="nav-label">WISHLIST</span>}
                </button>
            </div>
            <div className="nav-bottom">
                <button className="nav-item" title="Logout" onClick={handleLogout}>
                    <LogOut size={20} />
                </button>
            </div>
        </nav>

        {/* Main Dashboard Column */}
        <main className="main-content">
            {/* Top Header Banner */}
            <header className="profile-banner">
                <div className="welcome-text">
                    <div className="avatar-img">{initial}</div>
                    <div>
                        <h1 className="welcome-title">Hi {displayName}, Welcome back!</h1>
                        <p className="welcome-subtitle">Your organic journey with Natrue</p>
                    </div>
                </div>
                <div className="reward-points-badge">
                    <Leaf size={20} color="var(--primary-periwinkle)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 600, textTransform: 'uppercase' }}>Reward Points</div>
                        <div className="points-value">1,240</div>
                    </div>
                </div>
            </header>

            <div className="search-bar-container" style={{ marginBottom: '10px' }}>
                <input type="text" className="search-input" placeholder="Search your orders or products..." />
                <button className="search-btn"><Search size={16} /></button>
            </div>

            {/* Content Switcher */}
            <div className="dashboard-columns fade-in">
              
              {activeTab === 'profile' && (
                <>
                  <div className="col-1">
                      {/* Stats Grid */}
                      <div className="stats-grid">
                          <div className="stat-box">
                              <p className="stat-label">Total Orders</p>
                              <h2 className="stat-value">{orders.length}</h2>
                          </div>
                          <div className="stat-box">
                              <p className="stat-label">Active Orders</p>
                              <h2 className="stat-value">{activeOrders}</h2>
                          </div>
                          <div className="stat-box">
                              <p className="stat-label">Wishlist</p>
                              <h2 className="stat-value">{wishlistCount}</h2>
                          </div>
                      </div>

                      {/* Personal Information */}
                      <div className="info-card">
                          <div className="info-card-header">
                              <h3>Personal Information</h3>
                              <button className="edit-btn">Edit Profile</button>
                          </div>
                          <div className="info-row">
                              <p className="info-label">Email Address</p>
                              <p className="info-value">{user.email}</p>
                          </div>
                          <div className="info-row">
                              <p className="info-label">Phone Number</p>
                              <p className="info-value">{userProfile?.phone || 'Not provided'}</p>
                          </div>
                      </div>

                      {/* Shop Suggestion Box */}
                      <div className="shop-suggestion">
                          <Sprout size={40} color="var(--primary-periwinkle)" />
                          <div>
                              <h3 style={{ margin: '0 0 5px', color: 'var(--dark-periwinkle)', fontSize: '1.2rem' }}>Keep Shopping!</h3>
                              <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.9rem' }}>Explore our freshly added organic produce.</p>
                          </div>
                      </div>
                  </div>

                  <div className="col-2">
                      {/* Track Order */}
                      <div className="glass-card quick-actions-card">
                          <div className="post-input-area">
                              <Search size={18} color="var(--text-gray)" />
                              <input type="text" placeholder="Tracking number or Order ID" className="post-input" />
                          </div>
                          <button className="post-btn">Track</button>
                      </div>

                      {/* Recent Orders Preview */}
                      <div className="info-card pending-orders-card">
                          <div className="info-card-header" style={{ marginBottom: '15px' }}>
                              <h3>Recent Orders</h3>
                              <button onClick={() => setActiveTab('orders')} className="edit-btn" style={{ border: 'none', background: 'transparent' }}>View All</button>
                          </div>
                          <div className="order-list">
                              {isLoadingOrders ? (
                                <p style={{ fontSize: '0.85rem' }}>Loading...</p>
                              ) : orders.length === 0 ? (
                                <div className="empty-state" style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <Package size={30} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>No recent orders.</p>
                                </div>
                              ) : (
                                orders.slice(0, 3).map(order => (
                                  <div key={order.id} className="order-item" style={{ padding: '15px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.9rem' }}>Order #{order.id.substring(0,8)}</p>
                                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                                              {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                                          </p>
                                      </div>
                                      <span className={`status-badge ${order.status}`} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: 'rgba(46, 204, 113, 0.1)', color: 'var(--dark-periwinkle)', fontWeight: 600 }}>
                                          {order.status || 'Processing'}
                                      </span>
                                  </div>
                                ))
                              )}
                          </div>
                      </div>
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <div className="glass-card" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <h3>My Orders</h3>
                  {isLoadingOrders ? (
                    <div className="loading-spinner" style={{ margin: 'auto' }}><div className="spinner" /></div>
                  ) : orders.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-gray)' }}>
                      <Package size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.9rem' }}>You haven't placed any orders yet.</p>
                      <button className="post-btn" style={{ marginTop: '15px' }} onClick={() => router.push('/collections/all')}>Start Shopping</button>
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ marginTop: '15px' }}>
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
                              <td><strong style={{ color: 'var(--primary-periwinkle)', fontSize: '0.9rem' }}>#{order.id.slice(0, 8)}</strong></td>
                              <td style={{ fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{order.total}</td>
                              <td>
                                <span className={`status-badge status-${order.status || 'pending'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                  {order.status || 'Pending'}
                                </span>
                              </td>
                              <td>
                                <button className="action-btn" onClick={() => setSelectedOrder(order)}>Details</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Saved Addresses</h3>
                    <button className="post-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>+ Add New</button>
                  </div>
                  {!userProfile?.addresses || userProfile.addresses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-gray)' }}>
                      <MapPin size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.9rem' }}>No addresses saved yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                      {userProfile.addresses.map((addr, i) => (
                        <div key={i} className="glass-card" style={{ padding: '15px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)' }}>
                          <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                            <MapPin size={14} color="var(--primary-periwinkle)" />
                            {addr.name}
                          </h4>
                          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {addr.address}<br />
                            {addr.city}, {addr.state} - {addr.pincode}<br />
                            Phone: {addr.phone}
                          </p>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <button className="action-btn" style={{ flex: 1, padding: '6px' }}>Edit</button>
                            <button className="action-btn" style={{ flex: 1, padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
                  <h3>My Wishlist</h3>
                  {!userProfile?.wishlist || userProfile.wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                      <Heart size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.9rem' }}>Your wishlist is currently empty.</p>
                      <button className="post-btn" style={{ marginTop: '15px' }} onClick={() => router.push('/collections/all')}>Discover Products</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', marginTop: '15px' }}>
                      {userProfile.wishlist.map((item, i) => (
                        <div key={i} className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ width: '100%', height: '140px', borderRadius: '10px', background: 'linear-gradient(45deg, #f1f5f9, #e2e8f0)', overflow: 'hidden', position: 'relative' }}>
                             {item.image && <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />}
                             <button style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', color: '#ef4444' }}>
                               <Heart size={14} fill="currentColor" />
                             </button>
                          </div>
                          <h4 style={{ fontSize: '0.85rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '4px 0' }}>
                             {item.name || 'Product Name'}
                          </h4>
                          <div style={{ fontWeight: '700', color: 'var(--primary-periwinkle)', fontSize: '1rem' }}>₹{item.price || item.salePrice || 0}</div>
                          <button className="action-btn" style={{ width: '100%', marginTop: 'auto', background: 'var(--primary-periwinkle)', color: 'white', padding: '6px' }} onClick={() => router.push(`/products/${item.slug || ''}`)}>View</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', background: 'rgba(255,255,255,0.95)', padding: '25px', position: 'relative' }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: '18px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
              Order Details
              <span className={`status-badge status-${selectedOrder.status || 'pending'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                 {selectedOrder.status || 'Pending'}
              </span>
            </h3>
            
            <p style={{ color: 'var(--text-gray)', marginBottom: '15px', fontSize: '0.9rem' }}>Order ID: <strong style={{ color: 'var(--text-dark)' }}>#{selectedOrder.id}</strong></p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div style={{ padding: '15px', background: 'rgba(126, 142, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(126, 142, 241, 0.1)' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Shipping Address</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0, color: 'var(--text-dark)' }}>
                  <strong>{selectedOrder.shippingAddress?.name || userProfile?.name}</strong><br />
                  {selectedOrder.shippingAddress?.address}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}<br />
                  Phone: {selectedOrder.shippingAddress?.phone}
                </p>
              </div>
              <div style={{ padding: '15px', background: 'rgba(126, 142, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(126, 142, 241, 0.1)' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Order Info</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0, color: 'var(--text-dark)' }}>
                  Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}<br />
                  Payment: {selectedOrder.paymentMethod?.toUpperCase() || 'COD'}<br />
                  Items: {selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px', marginBottom: '12px' }}>Products</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'linear-gradient(45deg, #f1f5f9, #e2e8f0)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} color="var(--text-gray)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                      {item.variant && <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Variant: {item.variant}</div>}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '2px' }}>Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--primary-periwinkle)', fontSize: '0.9rem' }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(126, 142, 241, 0.1)', borderRadius: '10px', marginTop: '15px' }}>
                <strong style={{ fontSize: '0.95rem' }}>Total Amount</strong>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-periwinkle)' }}>₹{selectedOrder.total}</strong>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="post-btn" onClick={() => setSelectedOrder(null)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Close Window</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
