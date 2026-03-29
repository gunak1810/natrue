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
  { id: 1, name: 'Priya M.', text: 'Wonderful gift for kids! My kid loved the stationery set. Will order again!', rating: 5, product: 'Stationery Set' },
  { id: 2, name: 'Rajesh K.', text: 'Great quality keychains with perfect engraving. Used for corporate event.', rating: 5, product: 'Metal Keychain' },
  { id: 3, name: 'Anita S.', text: 'Bought 40 sling bags for return gifts. All kids were excited! Must buy!', rating: 5, product: 'Sling Bag' },
  { id: 4, name: 'Deepak P.', text: 'Good gifting options at reasonable price. Worth every rupee!', rating: 4, product: 'Scratch Notebook' },
  { id: 5, name: 'Meera R.', text: 'Totally loved the products. Kids were thrilled with the jewellery boxes!', rating: 5, product: 'Jewellery Box' },
  { id: 6, name: 'Suresh V.', text: 'Nice and excellent product for kids. Reduces screen time effectively.', rating: 5, product: 'Wooden Puzzle' },
];

const categoryIcons = {
  'return-gifts': '🎁', 'new-arrivals': '✨', 'stationery': '✏️', 'diy-kits': '🎨',
  'toys-games': '🧩', 'led-lamps': '💡', 'bags-pouches': '👜', 'gift-hampers': '🎀',
  'keychains': '🔑', 'water-bottles': '🍶', 'lunch-boxes': '🍱', 'personalization': '📝',
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fail-safe: loader timeout after 5s
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
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Icons Bar */}
      <section className="category-bar">
        <div className="container">
          <div className="category-scroll">
            {categories.map(cat => (
              <Link key={cat.id} href={`/collections/${cat.slug}`} className="category-chip">
                <span className="category-chip-icon">{categoryIcons[cat.slug] || '📦'}</span>
                <span className="category-chip-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Return Gifts Section */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Return Gifts 🎉</h2>
          <div className="product-grid">
            {(returnGifts.length > 0 ? returnGifts : featuredProducts).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && !loading && (
            <div className="seed-prompt">
              <p>No products yet! Add products via the admin panel or seed sample data.</p>
            </div>
          )}
          <div className="section-action">
            <Link href="/collections/return-gifts" className="btn btn-outline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">New Arrivals 🎉</h2>
          <div className="product-grid">
            {(newArrivals.length > 0 ? newArrivals : products).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="section-action">
            <Link href="/collections/new-arrivals" className="btn btn-outline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} href={`/collections/${cat.slug}`} className="category-card">
                <div className="category-card-icon">{categoryIcons[cat.slug] || '📦'}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stationery & Toys */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Trending Products 🔥</h2>
          <div className="product-grid">
            {(stationery.length > 0 ? [...stationery, ...toysGames] : products).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="section-action">
            <Link href="/collections/all" className="btn btn-outline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">What Our Customers Say 💜</h2>
          <div className="testimonials-grid">
            {sampleTestimonials.map(review => (
              <div key={review.id} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? '#FFB800' : '#DDD'} color={i < review.rating ? '#FFB800' : '#DDD'} />
                  ))}
                </div>
                <p className="testimonial-text">{review.text}</p>
                <div className="testimonial-footer">
                  <span className="testimonial-author">{review.name}</span>
                  <span className="testimonial-product">about {review.product}</span>
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
