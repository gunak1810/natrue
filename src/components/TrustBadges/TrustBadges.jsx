import { Truck, RefreshCw, Headphones } from 'lucide-react';
import './TrustBadges.css';

export default function TrustBadges() {
  return (
    <section className="trust-badges">
      <div className="container trust-badges-grid">
        <div className="trust-badge">
          <div className="trust-icon">
            <Truck size={32} />
          </div>
          <div className="trust-text">
            <h4>FREE SHIPPING</h4>
            <p>On orders above ₹500</p>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <RefreshCw size={32} />
          </div>
          <div className="trust-text">
            <h4>3 DAYS RETURN</h4>
            <p>Easy return & refund policy</p>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <Headphones size={32} />
          </div>
          <div className="trust-text">
            <h4>24/7 SUPPORT</h4>
            <p>WhatsApp chat support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
