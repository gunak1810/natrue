'use client';

import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings, seedSampleData } from '@/lib/firestore';
import { Save, Database } from 'lucide-react';

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: '', tagline: '', announcement: '', contactEmail: '', contactPhone: '', whatsappNumber: '', shippingThreshold: 500
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getStoreSettings();
        if (settings) {
          setForm({ ...form, ...settings });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettings(form);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedData = async () => {
    if (confirm('This will populate the database with dummy categories and products. This might take a few seconds. Proceed?')) {
      setSeeding(true);
      try {
        await seedSampleData();
        alert('Sample data seeded successfully! Go to the storefront to see the products.');
      } catch (err) {
        console.error('Error seeding data:', err);
        alert('Failed to seed data.');
      } finally {
        setSeeding(false);
      }
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="admin-settings">
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Store Settings</h3>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-input" name="tagline" value={form.tagline} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Announcement Bar Text</label>
            <input className="form-input" name="announcement" value={form.announcement} onChange={handleChange} />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input className="form-input" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-input" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input className="form-input" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Free Shipping Threshold (₹)</label>
              <input className="form-input" type="number" name="shippingThreshold" value={form.shippingThreshold} onChange={handleChange} />
            </div>
          </div>
          
          <div style={{ marginTop: 24, padding: 24, background: 'var(--color-bg-section)', borderRadius: 8 }}>
            <h4>Database Actions</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16 }}>
              Use the button below to seed sample data (Categories & Products) to see how the site looks.
            </p>
            <button type="button" onClick={handleSeedData} disabled={seeding} className="btn btn-outline-accent">
              <Database size={16} /> {seeding ? 'Seeding Data...' : 'Seed Sample Data'}
            </button>
          </div>

          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
