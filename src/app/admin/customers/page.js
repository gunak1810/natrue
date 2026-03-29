'use client';

import { useState, useEffect } from 'react';
import { getUsers } from '@/lib/firestore';
import { Mail, Phone, Calendar, User } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const users = await getUsers();
      setCustomers(users);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Customer Database</h3>
        <span className="badge badge-new">{customers.length} total</span>
      </div>
      <div className="table-responsive">
        {customers.length === 0 ? (
          <div className="admin-empty">No customers found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact info</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="admin-avatar" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
                        <User size={16} />
                      </div>
                      <div>
                        <strong>{customer.name || customer.displayName || 'Guest User'}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {customer.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Mail size={12} /> {customer.email || 'N/A'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Phone size={12} /> {customer.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${customer.role === 'admin' ? 'status-processing' : 'status-delivered'}`}>
                      {customer.role || 'customer'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Calendar size={12} /> {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
