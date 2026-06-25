'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const HeroSlider = dynamic(() => import('@/components/HeroSlider/HeroSlider'), { ssr: false });
const IntroOverlay = dynamic(() => import('@/components/IntroOverlay/IntroOverlay'), { ssr: false });
import ProductCard from '@/components/ProductCard/ProductCard';

import TrustBadges from '@/components/TrustBadges/TrustBadges';
import { getProducts, getCategories } from '@/lib/firestore';
import { Star, ArrowRight, Leaf, Shield, Sprout, Droplets } from 'lucide-react';
import './home.css';

const sampleTestimonials = [
  { id: 1, name: 'Meera S.', text: 'The cold-pressed coconut oil is absolutely pure. You can taste the freshness. My family loves it — we have been ordering every month now.', rating: 5, product: 'Cold-Pressed Coconut Oil' },
  { id: 2, name: 'Rajesh K.', text: 'Best organic honey I have ever tasted. The raw, unprocessed quality shows — thick, golden, and aromatic. Highly recommended for anyone making the switch.', rating: 5, product: 'Wild Forest Honey' },
  { id: 3, name: 'Anita P.', text: 'The millet combo pack is excellent quality and beautifully packed. Great for anyone starting a healthier lifestyle. Will be reordering.', rating: 5, product: 'Millet Combo Pack' },
  { id: 4, name: 'Deepak R.', text: 'The organic turmeric powder is so vibrant and fragrant. You can tell it is the real deal — no adulterants whatsoever. Worth every rupee spent.', rating: 4, product: 'Organic Turmeric' },
  { id: 5, name: 'Priya V.', text: 'Absolutely love the green tea collection. Fresh leaves, wonderful aroma, and the perfect morning ritual. Switching all my groceries to Natrue now.', rating: 5, product: 'Organic Green Tea' },
  { id: 6, name: 'Suresh M.', text: 'The A2 ghee is phenomenal — granular texture, rich aroma, exactly like homemade. This is by far the best organic store online. Period.', rating: 5, product: 'A2 Cow Ghee' },
];

/* Scroll-reveal hook using IntersectionObserver */
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('glass-revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useScrollReveal();
  return (
    <section
      ref={ref}
      className={`glass-section glass-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    async function fetchData() {
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ limit: 40 }),
          getCategories()
        ]);
        setProducts(prods);
        setCategories(cats);
        clearTimeout(timer);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => clearTimeout(timer);
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const returnGifts = products.filter(p => p.category === 'return-gifts');
  const newArrivals = products.filter(p => p.category !== 'return-gifts').slice(0, 8);
  const stationery = products.filter(p => p.category === 'stationery');
  const toysGames = products.filter(p => p.category === 'toys-games' || p.category === 'diy-kits');

  return (
    <>
      <IntroOverlay />
      <div className="home-page glass-home">
        {/* Hero */}
        <HeroSlider />



        {/* New Arrivals */}
        <RevealSection className="glass-products-section">
          <div className="container">
            <div className="glass-section-header">
              <span className="glass-section-eyebrow">Just Added</span>
              <h2 className="glass-section-title">New Arrivals</h2>
              <p className="glass-section-subtitle">
                Freshly sourced seasonal organic produce, just added to our collection
              </p>
            </div>
            <div className="product-grid">
              {(newArrivals.length > 0 ? newArrivals : products).slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="glass-section-action">
              <Link href="/collections/new-arrivals" className="glass-btn-outline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </RevealSection>

        {/* Shop by Category — Glass Cards */}
        <RevealSection className="glass-products-section glass-section-alt" delay={100}>
          <div className="container">
            <div className="glass-section-header">
              <span className="glass-section-eyebrow">Browse</span>
              <h2 className="glass-section-title">Shop by Category</h2>
              <p className="glass-section-subtitle">
                Explore our curated range of pure, organic essentials
              </p>
            </div>
            <div className="glass-category-grid">
              {categories.slice(0, 8).map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className="glass-cat-card"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="glass-cat-card-content">
                    <h3>{cat.name}</h3>
                    <span className="glass-cat-arrow">→</span>
                  </div>
                  <div className="glass-cat-card-glow" />
                </Link>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Curated Selection */}
        <RevealSection className="glass-products-section">
          <div className="container">
            <div className="glass-section-header">
              <span className="glass-section-eyebrow">Hand-Picked</span>
              <h2 className="glass-section-title">Curated Selection</h2>
              <p className="glass-section-subtitle">
                Organic essentials sourced directly from certified farms across India
              </p>
            </div>
            <div className="product-grid">
              {(returnGifts.length > 0 ? returnGifts : featuredProducts).slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {products.length === 0 && !loading && (
              <div className="glass-empty-prompt">
                <Sprout size={32} />
                <p>No products yet. Add products via the admin panel to get started.</p>
              </div>
            )}
            <div className="glass-section-action">
              <Link href="/collections/return-gifts" className="glass-btn-outline">
                Explore All <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </RevealSection>

        {/* Bestsellers */}
        <RevealSection className="glass-products-section glass-section-alt" delay={100}>
          <div className="container">
            <div className="glass-section-header">
              <span className="glass-section-eyebrow">Most Loved</span>
              <h2 className="glass-section-title">Bestsellers</h2>
              <p className="glass-section-subtitle">
                Most loved by our organic community — tried, tested, and trusted
              </p>
            </div>
            <div className="product-grid">
              {(stationery.length > 0 ? [...stationery, ...toysGames] : products).slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="glass-section-action">
              <Link href="/collections/all" className="glass-btn-outline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </RevealSection>

        {/* The Natrue Promise — Dark glass section */}
        <RevealSection className="glass-promise-section">
          <div className="container">
            <div className="glass-section-header">
              <span className="glass-section-eyebrow glass-eyebrow-light">Our Commitment</span>
              <h2 className="glass-section-title glass-title-light">The Natrue Promise</h2>
              <p className="glass-section-subtitle glass-subtitle-light">
                Every product upholds the highest standards of purity and sustainability
              </p>
            </div>
            <div className="glass-promise-grid">
              {[
                { num: '01', icon: <Droplets size={24} />, title: 'No Chemicals', desc: 'Grown without synthetic pesticides, herbicides, or fertilizers' },
                { num: '02', icon: <Shield size={24} />, title: 'Non-GMO', desc: 'All products are naturally sourced and non-genetically modified' },
                { num: '03', icon: <Sprout size={24} />, title: 'Nutrient Rich', desc: 'Higher nutritional value with natural vitamins and minerals intact' },
                { num: '04', icon: <Leaf size={24} />, title: 'Sustainable', desc: 'Eco-conscious farming that protects soil, water, and biodiversity' },
              ].map((item, i) => (
                <div key={i} className="glass-promise-card" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="glass-promise-icon">{item.icon}</div>
                  <div className="glass-promise-number">{item.num}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Testimonials — Glass cards */}
        <RevealSection className="glass-products-section glass-section-alt">
          <div className="container">
            <div className="glass-section-header">
              <span className="glass-section-eyebrow">Reviews</span>
              <h2 className="glass-section-title">What Our Community Says</h2>
              <p className="glass-section-subtitle">
                Real experiences from families who chose organic with Natrue.in
              </p>
            </div>
            <div className="glass-testimonials-grid">
              {sampleTestimonials.map((review, i) => (
                <div key={review.id} className="glass-testimonial-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="glass-testimonial-stars">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} fill={j < review.rating ? '#f0c040' : '#e0e0e0'} color={j < review.rating ? '#f0c040' : '#e0e0e0'} />
                    ))}
                  </div>
                  <p className="glass-testimonial-text">&ldquo;{review.text}&rdquo;</p>
                  <div className="glass-testimonial-footer">
                    <span className="glass-testimonial-author">{review.name}</span>
                    <span className="glass-testimonial-product">{review.product}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Newsletter CTA — Glass panel */}
        <RevealSection className="glass-newsletter-section">
          <div className="container">
            <div className="glass-newsletter-panel">
              <div className="glass-newsletter-glow" />
              <Leaf size={28} className="glass-newsletter-icon" />
              <h3>Join Our Organic Community</h3>
              <p>Subscribe for exclusive offers, seasonal picks, and farm-fresh updates</p>
              <div className="glass-newsletter-form">
                <input type="email" placeholder="Enter your email" className="glass-newsletter-input" />
                <button className="glass-newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* Loading State */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        )}
      </div>
    </>
  );
}
