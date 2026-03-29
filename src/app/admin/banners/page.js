'use client';

import { useState, useEffect } from 'react';
import { getAllBanners, addBanner, updateBanner, deleteBanner } from '@/lib/firestore';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', order: 0, active: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value);
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateBanner(editingId, form);
      } else {
        await addBanner(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', subtitle: '', image: '', link: '', order: 0, active: true });
      fetchBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setForm({ ...banner });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id);
        fetchBanners();
      } catch (err) {
        console.error('Error deleting banner:', err);
        alert('Failed to delete banner');
      }
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await updateBanner(banner.id, { active: !banner.active });
      fetchBanners();
    } catch (err) {
      console.error('Error toggling banner status:', err);
    }
  };

  if (loading && banners.length === 0) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Hero Banners</h3>
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Banner
            </button>
          )}
        </div>

        {showForm && (
          <div className="admin-form" style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h4>{editingId ? 'Edit Banner' : 'Add New Banner'}</h4>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Banner Title</label>
                  <input className="form-input" name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle (Optional)</label>
                  <input className="form-input" name="subtitle" value={form.subtitle} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" name="image" value={form.image} onChange={handleChange} required placeholder="/images/banners/hero-1.jpg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Link (URL)</label>
                  <input className="form-input" name="link" value={form.link} onChange={handleChange} placeholder="/collections/new-arrivals" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input className="form-input" type="number" name="order" value={form.order} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                    Active (Show on storefront)
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Save size={16} /> {submitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-responsive">
          {banners.length === 0 ? (
            <div className="admin-empty">No banners found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Image</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map(banner => (
                  <tr key={banner.id}>
                    <td style={{ width: '80px' }}>{banner.order}</td>
                    <td>
                      <div style={{ width: 100, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <ImageIcon size={20} color="var(--color-primary)" />
                      </div>
                    </td>
                    <td>
                      <strong>{banner.title}</strong>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{banner.subtitle || 'No subtitle'}</p>
                    </td>
                    <td>
                      <button onClick={() => toggleStatus(banner)} style={{ color: banner.active ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                        <span style={{ fontSize: '12px' }}>{banner.active ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn-edit" onClick={() => handleEdit(banner)}><Edit2 size={16} /></button>
                        <button className="btn-delete" onClick={() => handleDelete(banner.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
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
