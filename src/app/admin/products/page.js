'use client';

import { useState, useEffect } from 'react';
import { getProducts, addProduct, deleteProduct, updateProduct, getCategories, uploadFile } from '@/lib/firestore';
import { optimizeImage } from '@/lib/image-utils';

import { Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';


export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: 0, salePrice: 0, 
    category: '', stock: 0, featured: false, images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);


  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
    
    // Check if we should open the form with a specific category
    const cat = searchParams.get('category');
    const openAdd = searchParams.get('add');
    if (cat && openAdd) {
      setForm(prev => ({ ...prev, category: cat }));
      setShowForm(true);
    }
  }, [searchParams]);


  async function fetchData() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts({}), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value);

    
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Step 1: Optimize & Convert to WebP
        const optimizedBlob = await optimizeImage(file, { maxWidth: 1000, quality: 0.8 });
        
        // Step 2: Create a unique filename (.webp)
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
        const path = `products/${fileName}`;
        
        // Step 3: Upload
        return await uploadFile(optimizedBlob, path);
      });
      
      const urls = await Promise.all(uploadPromises);
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, form);
      } else {
        await addProduct(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', slug: '', description: '', price: 0, salePrice: 0, category: '', stock: 0, featured: false, images: [] });
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert(`Failed to save product: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (prod) => {
    setForm({ ...prod });
    setEditingId(prod.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && products.length === 0) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Product Management</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '32px', borderRadius: '4px', border: '1px solid #ddd', padding: '0 10px' }}
              />
            </div>
            {!showForm && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="admin-form" style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h4>{editingId ? 'Edit Product' : 'Add New Product'}</h4>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-input" name="slug" value={form.slug} onChange={handleChange} required />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" name="description" value={form.description} onChange={handleChange} style={{ height: '80px' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input className="form-input" type="number" name="price" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price</label>
                  <input className="form-input" type="number" name="salePrice" value={form.salePrice} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <input className="form-input" type="number" name="stock" value={form.stock} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Images (WebP Optimized)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  {form.images?.map((url, i) => (
                    <div key={i} style={{ position: 'relative', paddingTop: '100%', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border-light)' }}>
                      <Image src={url} alt={`Upload ${i}`} fill style={{ objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <label style={{ 
                    border: '2px dashed var(--color-border-light)', 
                    borderRadius: '4px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    minHeight: '80px',
                    transition: 'all 0.2s'
                  }}>
                    <Plus size={20} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {uploading ? 'Uploading...' : 'Add Image'}
                    </span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                  Featured Product (Home Page)
                </label>
              </div>


              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Save size={16} /> {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-responsive">
          {filteredProducts.length === 0 ? (
            <div className="admin-empty">No products found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          '🎁'
                        )}
                      </div>
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td><span className="badge badge-new" style={{ fontSize: '10px', background: 'var(--color-bg-section)', color: 'var(--color-primary)' }}>{product.category}</span></td>
                    <td>₹{product.salePrice || product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn-edit" onClick={() => handleEdit(product)}><Edit2 size={16} /></button>
                        <button className="btn-delete" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
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
