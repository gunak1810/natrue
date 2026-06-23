'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { getCategories, searchProducts } from '@/lib/firestore';
import dynamic from 'next/dynamic';


const CartDrawer = dynamic(() => import('../CartDrawer/CartDrawer'), { ssr: false });
const WhatsAppButton = dynamic(() => import('../WhatsAppButton/WhatsAppButton'), { ssr: false });
import './Header.css';





const defaultNav = [
  { name: 'Home', href: '/' },
];


export default function Header() {
  const { user, isAdmin } = useAuth();
  const { totalItems, isOpen, setIsOpen, isGoalScored, addedCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);




  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        // Only show segments marked for header
        setCategories(data.filter(cat => cat.showHeader !== false));
      } catch (err) {
        console.error('Error fetching header categories:', err);
      }
    }
    fetchCategories();
  }, []);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchQuery.trim());
          setLiveResults(results.slice(0, 6)); // Show top 6 results
        } catch (err) {
          console.error('Live search error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setLiveResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
      setLiveResults([]);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setLiveResults([]);
  };



  return (


    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-marquee">
          <span>FREE DELIVERY ON ORDERS ABOVE ₹500 &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 100% CERTIFIED ORGANIC PRODUCTS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; FARM-TO-TABLE FRESHNESS GUARANTEED &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; FREE DELIVERY ON ORDERS ABOVE ₹500 &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 100% CERTIFIED ORGANIC PRODUCTS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; FARM-TO-TABLE FRESHNESS GUARANTEED</span>
        </div>
      </div>

      {/* Main Header */}
      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-container">
          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle show-mobile" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="header-logo">
            <div className="logo-icon">
              <span>N</span>
            </div>
            <div className="logo-text">
              <span className="logo-name">Natrue</span>
              <span className="logo-tagline">Pure & Organic</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav hide-mobile">
            {defaultNav.map(item => (
              <div key={item.name} className="nav-item">
                <Link href={item.href} className="nav-link">{item.name}</Link>
              </div>
            ))}
            {categories.slice(0, 8).map((cat) => (
              <div key={cat.id} className="nav-item">
                <Link href={`/collections/${cat.slug}`} className="nav-link">
                  {cat.name}
                </Link>
              </div>
            ))}
            <div className="nav-item">
              <Link href="/collections/all" className="nav-link">View All</Link>
            </div>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            <button className="header-action-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
              <span className="action-label">Search</span>
            </button>
            <Link href={user ? '/account' : '/auth/login'} className="header-action-btn account-btn" aria-label="Account">
              <User size={20} />
              <span className="action-label">{user ? 'Account' : 'Login'}</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" className="header-action-btn admin-btn" aria-label="Admin Panel">
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <span className="action-label">Admin</span>
              </Link>
            )}
            <button className={`header-action-btn cart-btn ${isGoalScored ? 'goal-anim' : ''}`} onClick={() => setIsOpen(true)} aria-label="Cart">
              <div className="cart-icon-wrapper">
                {isGoalScored ? (
                  <span style={{ fontSize: '22px', display: 'flex', marginTop: '-2px' }}>🥅</span>
                ) : (
                  <ShoppingCart size={20} />
                )}
                {!isGoalScored && totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                {isGoalScored && <span className="goal-points-badge">+{addedCount}</span>}
              </div>
              <span className="action-label">{isGoalScored ? 'GOAL!' : 'Cart'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-overlay-content">
            <form onSubmit={handleSearch} className="search-form">
              <Search size={20} className="search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="button" className="search-close" onClick={closeSearch}>
                <X size={24} />
              </button>
            </form>

            {/* Live Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="search-results-overlay">
                {isSearching ? (
                  <div className="search-status">Searching...</div>
                ) : liveResults.length > 0 ? (
                  <div className="search-results-list">
                    {liveResults.map(product => (
                      <Link 
                        key={product.id} 
                        href={`/products/${product.slug}`}
                        className="search-result-item"
                        onClick={closeSearch}
                      >
                        <div className="search-result-img">
                          {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : 'N'}
                        </div>
                        <div className="search-result-info">
                          <span className="search-result-name">{product.name}</span>
                          <span className="search-result-price">₹{product.salePrice || product.price}</span>
                        </div>
                      </Link>
                    ))}
                    <button className="view-all-results" onClick={handleSearch}>
                      View all {liveResults.length >= 6 ? 'results' : ''} for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="search-status">No products found matching "{searchQuery}"</div>
                )}
              </div>
            )}

            <div className="popular-searches">
              <h4>Popular Searches:</h4>
              <div className="search-tags">
                {['Honey', 'Cold-Pressed Oils', 'Millets', 'A2 Ghee', 'Spices'].map(tag => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="search-tag" onClick={closeSearch}>
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="logo-name">Natrue</span>
          <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="mobile-nav">
          <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/collections/all" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Shop All Products</Link>
          <hr />
          <Link href={user ? '/account' : '/auth/login'} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            {user ? 'My Account' : 'Login / Register'}
          </Link>
          {isAdmin && (
            <Link href="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              ⚙️ Admin Panel
            </Link>
          )}
        </nav>
      </div>
      {mobileMenuOpen && <div className="overlay active" onClick={() => setMobileMenuOpen(false)} />}

      {/* Cart Drawer */}
      <CartDrawer />



      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Spacer */}
      <div style={{ height: `calc(var(--header-height) + var(--announcement-height))` }} />
    </>
  );
}

