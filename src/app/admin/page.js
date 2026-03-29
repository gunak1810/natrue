'use client';

import { useState, useEffect } from 'react';
import { getProducts, getOrders, getUsers } from '@/lib/firestore';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0, orders: 0, users: 0, revenue: 0, loading: true
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allProds, allOrds, usersList] = await Promise.all([
          getProducts({}),
          getOrders({ limit: 50 }), // Get more to calculate revenue
          getUsers()
        ]);
        
        const rev = allOrds.reduce((sum, order) => sum + (order.total || 0), 0);
        
        setStats({
          products: allProds.length,
          orders: allOrds.length,
          users: usersList.length,
          revenue: rev,
          loading: false
        });
        
        setRecentOrders(allOrds.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchData();
  }, []);

  if (stats.loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><DollarSign /></div>
          <div className="stat-info">
            <h4>Total Revenue</h4>
            <div className="stat-value">₹{stats.revenue.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><ShoppingCart /></div>
          <div className="stat-info">
            <h4>Total Orders</h4>
            <div className="stat-value">{stats.orders}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Package /></div>
          <div className="stat-info">
            <h4>Products</h4>
            <div className="stat-value">{stats.products}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Users /></div>
          <div className="stat-info">
            <h4>Customers</h4>
            <div className="stat-value">{stats.users}</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Recent Orders</h3>
          <Link href="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-responsive">
          {recentOrders.length === 0 ? (
            <div className="admin-empty">No orders found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><Link href={`/admin/orders`} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>#{order.id.slice(0, 8)}</Link></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.shippingAddress?.name || 'Guest'}</td>
                    <td>
                      <span className={`status-badge status-${order.status || 'pending'}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td><strong>₹{order.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
