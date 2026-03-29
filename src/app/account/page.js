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
                              <Link href="#" className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>Details</Link>
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
                  <p>Items in wishlist: {userProfile.wishlist.length}</p>
                )}
              </div>
            </>
          )}
        </main>

      </div>
    </div>
  );
}
