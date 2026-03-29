'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getCategories } from '@/lib/firestore';
import './Footer.css';




export default function Footer() {
  const [categories, setCategories] = useState([]);



  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching footer categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const footerCategories = categories.filter(cat => cat.showFooter !== false).slice(0, 6);
  const footerQuickLinks = categories.filter(cat => !!cat.showQuickLinks);





  return (
    <footer className="footer">
      {/* Top Bar */}
      <div className="footer-top">
        <div className="container footer-top-content">
          <div className="footer-contact-item">
            <Phone size={18} />
            <span>+91 9322990002</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={18} />
            <span>support@craftszone.in</span>
          </div>
          <div className="footer-contact-item">
            <MapPin size={18} />
            <span>India</span>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Newsletter */}
          <div className="footer-col footer-newsletter">
            <div className="footer-logo">
              <span className="logo-icon-sm">🎨</span>
              <span className="footer-brand">CraftsZone</span>
            </div>
            <p className="footer-desc">
              India&#39;s favorite destination for unique gifts, trendy stationery, and personalized products. 
              Making celebrations special since 2024!
            </p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
            <div className="footer-socials">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/collections/all">All Products</Link></li>
              {footerQuickLinks.map(cat => (
                <li key={cat.id}>
                  <Link href={`/collections/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>


          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              {footerCategories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/collections/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
              {footerCategories.length === 0 && (
                <>
                  <li><Link href="/collections/stationery">Fancy Stationery</Link></li>
                  <li><Link href="/collections/led-lamps">LED Lamps</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-col">
            <h4 className="footer-heading">Policies</h4>
            <ul className="footer-links">
              <li><Link href="/policies/shipping">Shipping Policy</Link></li>
              <li><Link href="/policies/returns">Return & Refund</Link></li>
              <li><Link href="/policies/privacy">Privacy Policy</Link></li>
              <li><Link href="/policies/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} CraftsZone. All rights reserved.</p>
          <div className="payment-icons">
            <span className="payment-icon">💳</span>
            <span className="payment-icon">🏦</span>
            <span className="payment-icon">📱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
