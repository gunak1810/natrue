'use client';

import { useState, useEffect } from 'react';
import { getCategories, addCategory, deleteCategory, updateCategory } from '@/lib/firestore';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', slug: '', description: '', order: 0,
    showHeader: true, showFooter: true, showQuickLinks: false 
  });
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (name === 'name' && !editingId) {
      setForm(prev => ({ 
        ...prev, 
        name: value, 
        slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') 
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: val }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await addCategory(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', slug: '', description: '', order: 0, showHeader: true, showFooter: true, showQuickLinks: false });
      fetchCategories();

    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ 
      name: cat.name, 
      slug: cat.slug, 
      description: cat.description || '', 
      order: cat.order || 0,
      showHeader: cat.showHeader !== undefined ? cat.showHeader : true,
      showFooter: cat.showFooter !== undefined ? cat.showFooter : true,
      showQuickLinks: !!cat.showQuickLinks
    });
    setEditingId(cat.id);
    setShowForm(true);
  };


  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category? Products in this category will not be deleted but may become unlinked.')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category');
      }
    }
  };

  if (loading && categories.length === 0) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Categories Management</h3>
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Category
            </button>
          )}
        </div>

        {showForm && (
          <div className="admin-form" style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h4>{editingId ? 'Edit Category' : 'Add New Category'}</h4>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Return Gifts" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug (URL)</label>
                  <input className="form-input" name="slug" value={form.slug} onChange={handleChange} required placeholder="e.g. return-gifts" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" name="order" value={form.order} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input className="form-input" name="description" value={form.description} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>Visibility Options</label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="showHeader" checked={form.showHeader} onChange={handleChange} />
                    Show in Header
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="showFooter" checked={form.showFooter} onChange={handleChange} />
                    Show in Footer Categories
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="showQuickLinks" checked={form.showQuickLinks} onChange={handleChange} />
                    Show in Footer Quick Links
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Save size={16} /> {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-responsive">
          {categories.length === 0 ? (
            <div className="admin-empty">No categories found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ width: '80px' }}>{cat.order}</td>
                    <td><strong>{cat.name}</strong></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{cat.slug}</td>
                    <td>
                      <div className="admin-actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => window.location.href = `/admin/products?category=${cat.slug}&add=true`}
                          title="Add Product to this category"
                        >
                          <Plus size={16} />
                        </button>
                        <button className="btn-edit" onClick={() => handleEdit(cat)} title="Edit Category"><Edit2 size={16} /></button>
                        <button className="btn-delete" onClick={() => handleDelete(cat.id)} title="Delete Category"><Trash2 size={16} /></button>
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
