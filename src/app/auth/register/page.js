'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../login/auth.css';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.phone);
      if (form.email === 'admin.craftszone@gmail.com' || form.email === 'customersupport@natrue.in') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.user.email === 'admin.craftszone@gmail.com' || result.user.email === 'customersupport@natrue.in') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-banner">
           <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: 'var(--color-nature-deep)' }}>Natrue</div>
           <p style={{ marginTop: '15px', color: 'var(--color-nature-mid)', fontSize: '1.1rem', fontWeight: 500 }}>Pure Organic Food & Natural Products</p>
        </div>
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join Natrue and start shopping!</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" /></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" /></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="••••••••" /></div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
          <div className="auth-divider"><span>or</span></div>
          <button className="btn btn-white btn-lg btn-full google-btn" onClick={handleGoogle}>
            <span>🔵</span> Continue with Google
          </button>
          <p className="auth-footer">Already have an account? <Link href="/auth/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
