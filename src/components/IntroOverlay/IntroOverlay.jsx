'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowDown, Leaf } from 'lucide-react';
import './IntroOverlay.css';

export default function IntroOverlay() {
  const [dismissed, setDismissed] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const overlayRef = useRef(null);
  
  const triggerDismiss = useCallback(() => {
    setAnimatingOut((prev) => {
      if (prev) return prev;
      setTimeout(() => {
        setDismissed(true);
        sessionStorage.setItem('natrueIntroDismissed', 'true');
        document.body.style.overflow = '';
      }, 800);
      return true;
    });
  }, []);
  
  useEffect(() => {
    // Check if already dismissed in session
    if (sessionStorage.getItem('natrueIntroDismissed')) {
      setDismissed(true);
      return;
    }
    
    // Prevent body scroll while intro is visible
    document.body.style.overflow = 'hidden';
    
    const handleScrollIntent = (e) => {
      // If they wheel down or touch-drag up, dismiss
      if (e.type === 'wheel' && e.deltaY > 0) {
        triggerDismiss();
      }
    };
    
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      if (touchStartY - touchEndY > 20) {
        triggerDismiss();
      }
    };

    window.addEventListener('wheel', handleScrollIntent);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', handleScrollIntent);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [triggerDismiss]);

  if (dismissed) return null;

  return (
    <div 
      className={`intro-overlay ${animatingOut ? 'intro-dismissing' : ''}`} 
      ref={overlayRef}
    >
      {/* Organic gradient background */}
      <div className="hero-gradient-bg" />

      {/* Floating glass orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div className="hero-orb hero-orb-4" />

      {/* Grid pattern overlay */}
      <div className="hero-grid-pattern" />

      {/* Content */}
      <div className="hero-content-wrapper">
        <div className="hero-eyebrow">
          <Leaf size={14} />
          <span>100% Certified Organic</span>
        </div>

        <h1 className="hero-main-title">
          <span className="hero-title-line hero-title-line-1">Pure</span>
          <span className="hero-title-line hero-title-line-2">
            <span className="hero-title-accent">Natrue</span>
          </span>
          <span className="hero-title-line hero-title-line-3">Delivered</span>
        </h1>

        <p className="hero-main-desc">
          Farm-fresh organic essentials — cold-pressed oils, raw honey, millets, and spices.
          Directly from certified farms to your doorstep.
        </p>

        <div className="hero-cta-group">
          <button onClick={triggerDismiss} className="hero-btn-primary">
            Explore Collection
          </button>
        </div>

        {/* Trust pills */}
        <div className="hero-trust-pills">
          <div className="trust-pill">
            <span className="trust-pill-dot" />
            Free Delivery ₹500+
          </div>
          <div className="trust-pill">
            <span className="trust-pill-dot" />
            Farm to Table
          </div>
          <div className="trust-pill">
            <span className="trust-pill-dot" />
            Non-GMO
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator" onClick={triggerDismiss} style={{ cursor: 'pointer' }}>
        <span>Scroll to explore</span>
        <ArrowDown size={16} className="hero-scroll-arrow" />
      </div>
    </div>
  );
}
