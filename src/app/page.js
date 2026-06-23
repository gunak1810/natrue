'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const HeroSlider = dynamic(() => import('@/components/HeroSlider/HeroSlider'), { ssr: true });
import ProductCard from '@/components/ProductCard/ProductCard';

import TrustBadges from '@/components/TrustBadges/TrustBadges';
import { getProducts, getCategories } from '@/lib/firestore';
import { Star, ArrowRight } from 'lucide-react';
import './home.css';

const sampleTestimonials = [
  { id: 1, name: 'Meera S.', text: 'The cold-pressed coconut oil is absolutely pure. You can taste the freshness. My family loves it — we have been ordering every month now.', rating: 5, product: 'Cold-Pressed Coconut Oil' },
  { id: 2, name: 'Rajesh K.', text: 'Best organic honey I have ever tasted. The raw, unprocessed quality shows — thick, golden, and aromatic. Highly recommended for anyone making the switch.', rating: 5, product: 'Wild Forest Honey' },
  { id: 3, name: 'Anita P.', text: 'The millet combo pack is excellent quality and beautifully packed. Great for anyone starting a healthier lifestyle. Will be reordering.', rating: 5, product: 'Millet Combo Pack' },
  { id: 4, name: 'Deepak R.', text: 'The organic turmeric powder is so vibrant and fragrant. You can tell it is the real deal — no adulterants whatsoever. Worth every rupee spent.', rating: 4, product: 'Organic Turmeric' },
  { id: 5, name: 'Priya V.', text: 'Absolutely love the green tea collection. Fresh leaves, wonderful aroma, and the perfect morning ritual. Switching all my groceries to Natrue now.', rating: 5, product: 'Organic Green Tea' },
  { id: 6, name: 'Suresh M.', text: 'The A2 ghee is phenomenal — granular texture, rich aroma, exactly like homemade. This is by far the best organic store online. Period.', rating: 5, product: 'A2 Cow Ghee' },
];

const categoryIcons = {
  'cold-pressed-oils': '🫒', 'honey': '🍯', 'millets': '🌾', 'spices': '🌶️',
  'dry-fruits': '🥜', 'tea-coffee': '🍵', 'ghee-dairy': '🧈', 'superfoods': '🥗',
  'herbal-care': '🌿', 'organic-snacks': '🍪', 'pulses-grains': '🫘', 'gift-hampers': '🎁',
  'return-gifts': '🎁', 'new-arrivals': '🌱', 'stationery': '📝', 'diy-kits': '🎨',
  'toys-games': '🧩', 'led-lamps': '💡', 'bags-pouches': '👜',
  'keychains': '🔑', 'water-bottles': '🍶', 'lunch-boxes': '🍱', 'personalization': '📝',
};

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
    <div className="home-page">
      {/* Hero */}
      <HeroSlider />

      {/* Category Bar */}
      <section className="category-bar">
        <div className="container">
          <div className="category-scroll">
            {categories.map(cat => (
              <Link key={cat.id} href={`/collections/${cat.slug}`} className="category-chip">
                <span className="category-chip-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Selection */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Curated Selection</h2>
          <p className="section-subtitle">Hand-picked organic essentials, sourced directly from certified farms across India</p>
          <div className="product-grid">
            {(returnGifts.length > 0 ? returnGifts : featuredProducts).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && !loading && (
            <div className="seed-prompt">
              <p>No products yet. Add products via the admin panel to get started.</p>
            </div>
          )}
          <div className="section-action">
            <Link href="/collections/return-gifts" className="btn btn-outline">
              Explore All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Freshly sourced seasonal organic produce, just added to our collection</p>
          <div className="product-grid">
            {(newArrivals.length > 0 ? newArrivals : products).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="section-action">
            <Link href="/collections/new-arrivals" className="btn btn-outline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore our curated range of pure, organic essentials</p>
          <div className="category-grid">
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} href={`/collections/${cat.slug}`} className="category-card">
                <h3>{cat.name}</h3>
                <span className="category-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Bestsellers</h2>
          <p className="section-subtitle">Most loved by our organic community — tried, tested, and trusted</p>
          <div className="product-grid">
            {(stationery.length > 0 ? [...stationery, ...toysGames] : products).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="section-action">
            <Link href="/collections/all" className="btn btn-outline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* The Natrue Promise */}
      <section className="section promise-section">
        <div className="container">
          <h2 className="section-title">The Natrue Promise</h2>
          <p className="section-subtitle">Every product we offer upholds the highest standards of purity and sustainability</p>
          <div className="promise-grid">
            <div className="promise-card">
              <div className="promise-number">01</div>
              <h4>No Chemicals</h4>
              <p>Grown without synthetic pesticides, herbicides, or fertilizers</p>
            </div>
            <div className="promise-card">
              <div className="promise-number">02</div>
              <h4>Non-GMO</h4>
              <p>All products are naturally sourced and non-genetically modified</p>
            </div>
            <div className="promise-card">
              <div className="promise-number">03</div>
              <h4>Nutrient Rich</h4>
              <p>Higher nutritional value with natural vitamins and minerals intact</p>
            </div>
            <div className="promise-card">
              <div className="promise-number">04</div>
              <h4>Sustainable</h4>
              <p>Eco-conscious farming that protects soil, water, and biodiversity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">What Our Community Says</h2>
          <p className="section-subtitle">Real experiences from families who chose organic with Natrue.in</p>
          <div className="testimonials-grid">
            {sampleTestimonials.map(review => (
              <div key={review.id} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={i < review.rating ? '#b8860b' : '#e0e0e0'} color={i < review.rating ? '#b8860b' : '#e0e0e0'} />
                  ))}
                </div>
                <p className="testimonial-text">&ldquo;{review.text}&rdquo;</p>
                <div className="testimonial-footer">
                  <span className="testimonial-author">{review.name}</span>
                  <span className="testimonial-product">{review.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}
