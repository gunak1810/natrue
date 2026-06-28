'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { searchProducts } from '@/lib/firestore';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
      setLiveResults([]);
    }
  };

  const handleInputChange = async (value) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setIsSearching(true);
      try {
        const results = await searchProducts(value.trim());
        setLiveResults(results.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setLiveResults([]);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'categories', label: 'Categories', icon: Grid, href: '/categories' },
  ];

  const isActive = (tab) => {
    if (tab.id === 'home') return pathname === '/';
    if (tab.id === 'categories') return pathname === '/categories';
    if (tab.id === 'account') return pathname === '/account' || pathname.startsWith('/auth');
    return false;
  };

  return (
    <>
      <nav className="mobile-bottom-nav" id="mobile-bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);

          if (tab.href) {
            return (
              <Link key={tab.id} href={tab.href} className={`mobile-bottom-tab ${active ? 'active' : ''}`}>
                <div className="mobile-tab-icon">
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className="mobile-tab-label">{tab.label}</span>
              </Link>
            );
          }

          return (
            <button key={tab.id} className={`mobile-bottom-tab ${active ? 'active' : ''}`} onClick={tab.action}>
              <div className="mobile-tab-icon">
                <Icon size={22} strokeWidth={1.8} />
                {tab.id === 'cart' && totalItems > 0 && (
                  <span className="mobile-cart-badge">{totalItems > 9 ? '9+' : totalItems}</span>
                )}
              </div>
              <span className="mobile-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-header">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <Search size={18} className="mobile-search-icon" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                className="mobile-search-input"
                autoFocus
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setLiveResults([]); }} className="mobile-search-close-btn">
                <X size={20} />
              </button>
            </form>
          </div>

          <div className="mobile-search-body">
            {searchQuery.trim().length >= 2 ? (
              isSearching ? (
                <div className="mobile-search-status">Searching...</div>
              ) : liveResults.length > 0 ? (
                <div className="mobile-search-results">
                  {liveResults.map(product => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="mobile-search-result-item"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); setLiveResults([]); }}
                    >
                      <div className="mobile-search-result-img">
                        {(product.image || product.images?.[0]) ? (
                          <img src={product.image || product.images[0]} alt={product.name} />
                        ) : '🎁'}
                      </div>
                      <div className="mobile-search-result-info">
                        <span className="mobile-search-result-name">{product.name}</span>
                        <span className="mobile-search-result-price">₹{product.salePrice || product.price}</span>
                      </div>
                    </Link>
                  ))}
                  <button className="mobile-search-view-all" onClick={handleSearch}>
                    View all results for "{searchQuery}"
                  </button>
                </div>
              ) : (
                <div className="mobile-search-status">No products found</div>
              )
            ) : (
              <div className="mobile-search-popular">
                <h4>Popular Searches</h4>
                <div className="mobile-search-tags">
                  {['Honey', 'Cold-Pressed Oils', 'Millets', 'A2 Ghee', 'Spices', 'Turmeric'].map(tag => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="mobile-search-tag"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
