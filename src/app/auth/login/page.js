'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './auth.css';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (email === 'admin.craftszone@gmail.com' || email === 'customersupport@natrue.in') {
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
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn btn-white btn-lg btn-full google-btn" onClick={handleGoogle}>
            <span>🔵</span> Continue with Google
          </button>

          <p className="auth-footer">
            Don&#39;t have an account? <Link href="/auth/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
