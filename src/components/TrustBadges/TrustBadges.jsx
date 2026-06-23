import { ShieldCheck, Leaf, Feather, Droplets } from 'lucide-react';
import './TrustBadges.css';

export default function TrustBadges() {
  return (
    <section className="trust-badges">
      <div className="container trust-badges-grid">
        <div className="trust-badge">
          <div className="trust-icon">
            <Leaf size={24} strokeWidth={1.5} />
          </div>
          <div className="trust-text">
            <h4>Certified Organic</h4>
            <p>100% pure & natural</p>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <Droplets size={24} strokeWidth={1.5} />
          </div>
          <div className="trust-text">
            <h4>Cold Pressed</h4>
            <p>Retaining natural nutrients</p>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="trust-text">
            <h4>No Preservatives</h4>
            <p>Free from chemicals</p>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <Feather size={24} strokeWidth={1.5} />
          </div>
          <div className="trust-text">
            <h4>Ethically Sourced</h4>
            <p>Direct from farmers</p>
          </div>
        </div>
      </div>
    </section>
  );
}
