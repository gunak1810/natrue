'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('../CartDrawer/CartDrawer'), { ssr: false });
const WhatsAppButton = dynamic(() => import('../WhatsAppButton/WhatsAppButton'), { ssr: false });

import './FloatingNav.css';

export default function FloatingNav({ isStatic = false }) {
  const { user, isAdmin } = useAuth();
  const { totalItems, setIsOpen, isGoalScored, addedCount } = useCart();
  const [visible, setVisible] = useState(isStatic);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isStatic) return;

    const handleScroll = () => {
      const isDismissed = sessionStorage.getItem('natrueIntroDismissed');
      if (isDismissed || window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    handleScroll(); // Check on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStatic]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className={`floating-nav ${visible ? 'floating-nav-visible' : ''}`}>
        {/* Left side: Logo + Badge */}
        <div className="floating-nav-left">
          <Link href="/" className="floating-nav-logo">
            <span className="floating-logo-icon">N</span>
            <span className="floating-logo-text">Natrue</span>
          </Link>

          {/* Organic Badge */}
          <div className="floating-organic-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 14 6h5a2 2 0 0 1 2 2v5a7 7 0 0 1-7 7z"/><path d="M11 20a7 7 0 0 1-7-7v-5a2 2 0 0 1 2-2h5a7 7 0 0 1 7 7z"/><path d="M11 20v-5"/><path d="M11 15a3 3 0 0 1 3-3"/></svg>
            100% Certified Organic
          </div>
        </div>

        {/* Center Links */}
        <div className="floating-nav-links">
          <Link href="/" className="floating-link">Home</Link>
          <Link href="/categories" className="floating-link">Categories</Link>
          {isAdmin && (
            <Link href="/admin" className="floating-link" style={{ color: '#1a6b4a', fontWeight: 700 }}>Admin Panel</Link>
          )}
        </div>

        {/* Actions */}
        <div className="floating-nav-actions">
          <button
            className="floating-action-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search size={18} />
            <span className="floating-action-label">Search</span>
          </button>
          <Link
            href={user ? '/account' : '/auth/login'}
            className="floating-action-btn"
            aria-label="Account"
          >
            <User size={18} />
            <span className="floating-action-label">{user?.displayName?.split(' ')[0] || (user ? 'Profile' : 'Login')}</span>
          </Link>
          <button
            className="floating-action-btn floating-cart-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Cart"
          >
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="floating-cart-count">{totalItems}</span>
              )}
            </div>
            <span className="floating-action-label">Cart</span>
          </button>
        </div>
      </nav>

      {/* Search Dropdown */}
      {searchOpen && visible && (
        <div className="floating-search-panel">
          <form onSubmit={handleSearch} className="floating-search-form">
            <Search size={16} className="floating-search-icon" />
            <input
              type="text"
              placeholder="Search organic products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="floating-search-input"
              autoFocus
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="floating-search-close">
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
