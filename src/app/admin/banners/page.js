'use client';

import { useState, useEffect } from 'react';
import { getAllBanners, addBanner, updateBanner, deleteBanner, uploadFile } from '@/lib/firestore';
import { convertToWebP } from '@/lib/imageUtils';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    desc: '',
    link: '',
    color: '#0a3d2a',
    order: 0,
    active: true,
    showOverlay: true,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Convert to WebP
      const webpFile = await convertToWebP(file, 1600, 0.85);
      setImageFile(webpFile);
    } catch (err) {
      console.error('Error converting image:', err);
      alert('Failed to process image. Try a different file.');
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        desc: banner.desc || '',
        link: banner.link || '',
        color: banner.color || '#0a3d2a',
        order: banner.order || 0,
        active: banner.active ?? true,
        showOverlay: banner.showOverlay ?? true,
      });
      setImagePreview(banner.image);
      setImageFile(null);
    } else {
      setEditingBanner(null);
      setForm({
        title: '',
        subtitle: '',
        desc: '',
        link: '',
        color: '#0a3d2a',
        order: banners.length,
        active: true,
        showOverlay: true,
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("Please select an image");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = imagePreview;

      // If a new file was selected, upload it
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, `banners/${Date.now()}_${imageFile.name}`);
      }

      const bannerData = {
        ...form,
        order: Number(form.order),
        image: imageUrl
      };

      if (editingBanner) {
        await updateBanner(editingBanner.id, bannerData);
      } else {
        await addBanner(bannerData);
      }

      await fetchBanners();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving banner:", err);
      alert("Failed to save banner");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner(id);
        await fetchBanners();
      } catch (err) {
        console.error(err);
        alert("Failed to delete banner");
      }
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Banners</h1>
          <p className="admin-subtitle">Manage homepage hero slider images</p>
        </div>
        <button className="admin-btn primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {banners.length === 0 ? (
          <div className="admin-empty-state" style={{ gridColumn: '1 / -1' }}>
            <ImageIcon size={48} />
            <h3 style={{ marginTop: '16px' }}>No banners yet</h3>
            <p>Add your first banner to display on the homepage.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="admin-card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '8px' }}>
                <button className="admin-icon-btn edit" onClick={() => handleOpenModal(banner)}><Edit2 size={16} /></button>
                <button className="admin-icon-btn delete" onClick={() => handleDelete(banner.id)}><Trash2 size={16} /></button>
              </div>
              
              <div style={{ width: '100%', height: '160px', position: 'relative', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{banner.title}</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{banner.subtitle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`admin-badge ${banner.active ? 'success' : 'neutral'}`}>
                  {banner.active ? 'Active' : 'Hidden'}
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>Order: {banner.order}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add Banner'}</h2>
              <button className="admin-close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal-form">
              {/* Image Upload Area */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Banner Image (Will be converted to WebP)</label>
                <div className="image-upload-area" style={{ height: '200px', background: '#f8f9fa', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="upload-overlay">
                        <span style={{ color: 'white', fontWeight: 'bold' }}>Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b' }}>
                      <Upload size={32} style={{ marginBottom: '8px' }} />
                      <span>Click to upload image</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Cold-Pressed Oils" />
                </div>
                <div className="form-group">
                  <label>Subtitle</label>
                  <input className="form-input" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} required placeholder="e.g. 100% Pure & Unrefined" />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea className="form-input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} rows="2" placeholder="e.g. Extracted using traditional wooden Ghani..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Link (URL)</label>
                  <input className="form-input" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="e.g. /collections/oils" />
                </div>
                <div className="form-group">
                  <label>Theme Color (Hex)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                    <input className="form-input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" className="form-input" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <span>Active (Show on homepage)</span>
                  </label>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input type="checkbox" checked={form.showOverlay} onChange={e => setForm({...form, showOverlay: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <span>Show text overlay card</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <button type="button" className="admin-btn outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={uploading}>
                  {uploading ? 'Uploading WebP...' : (editingBanner ? 'Save Changes' : 'Add Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
