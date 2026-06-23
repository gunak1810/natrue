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
            <Phone size={14} />
            <span>+91 9322990002</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={14} />
            <span>support@natrue.in</span>
          </div>
          <div className="footer-contact-item">
            <MapPin size={14} />
            <span>India</span>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand & Newsletter */}
          <div className="footer-col footer-newsletter">
            <div className="footer-logo">
              <span className="logo-icon-sm">N</span>
              <span className="footer-brand">Natrue</span>
            </div>
            <p className="footer-desc">
              India&apos;s trusted destination for certified organic food, cold-pressed oils, raw honey, and natural products. 
              Elevating your lifestyle with farm-fresh goodness since 2024.
            </p>
            <div className="newsletter-form">
              <input type="email" placeholder="Subscribe to our journal" className="newsletter-input" />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
            <div className="footer-socials">
              <a href="#" className="social-icon" aria-label="Facebook">
                FB
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                IG
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                TW
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                YT
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/collections/all">Our Collection</Link></li>
              {footerQuickLinks.map(cat => (
                <li key={cat.id}>
                  <Link href={`/collections/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>


          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links">
              {footerCategories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/collections/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
              {footerCategories.length === 0 && (
                <>
                  <li><Link href="/collections/cold-pressed-oils">Cold-Pressed Oils</Link></li>
                  <li><Link href="/collections/honey">Organic Honey</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-col">
            <h4 className="footer-heading">Information</h4>
            <ul className="footer-links">
              <li><Link href="/policies/shipping">Shipping Policy</Link></li>
              <li><Link href="/policies/returns">Returns & Refunds</Link></li>
              <li><Link href="/policies/privacy">Privacy Policy</Link></li>
              <li><Link href="/policies/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Natrue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
