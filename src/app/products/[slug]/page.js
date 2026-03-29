'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProductBySlug, getProducts, getReviews } from '@/lib/firestore';
import { Star, Minus, Plus, ShoppingCart, Zap, Truck, RefreshCw, Shield, ChevronDown } from 'lucide-react';
import './product.css';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const prod = await getProductBySlug(params.slug);
        setProduct(prod);
        if (prod) {
          const related = await getProducts({ category: prod.category, limit: 4 });
          setRelatedProducts(related.filter(p => p.id !== prod.id));
          try {
            const revs = await getReviews(prod.id);
            setReviews(revs);
          } catch(e) {}
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!product) return (
    <div className="empty-state">
      <h3>Product not found</h3>
      <p>The product you are looking for does not exist.</p>
      <Link href="/collections/all" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  const discount = product.salePrice < product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill={i < Math.round(rating) ? '#FFB800' : '#DDD'} color={i < Math.round(rating) ? '#FFB800' : '#DDD'} />
    ));
  };

  return (
    <div className="product-page">
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href={`/collections/${product.category}`}>{product.category}</Link>
          <span className="separator">/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              <div className="product-img-large">🎁</div>
              {discount > 0 && <span className="product-badge badge-sale">-{discount}%</span>}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">{renderStars(product.rating || 0)}</div>
              <span className="rating-count">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="product-pricing">
              <span className="product-sale-price">₹{product.salePrice || product.price}</span>
              {discount > 0 && (
                <>
                  <span className="product-original-price">₹{product.price}</span>
                  <span className="product-discount">Save {discount}%</span>
                </>
              )}
            </div>

            <p className="product-short-desc">{product.description}</p>

            {/* Variants */}
            {product.variants?.map((variant, idx) => (
              <div key={idx} className="product-variant-group">
                <label className="variant-label">{variant.name}:</label>
                <div className="variant-options">
                  {variant.options?.map(option => (
                    <button
                      key={option}
                      className={`variant-btn ${selectedVariant === option ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="product-quantity">
              <label className="variant-label">Quantity:</label>
              <div className="qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button className="btn btn-outline-accent btn-lg btn-full" onClick={() => addToCart(product, quantity, selectedVariant)}>
                <ShoppingCart size={18} /> ADD TO CART
              </button>
              <button className="btn btn-accent btn-lg btn-full" onClick={() => {
                addToCart(product, quantity, selectedVariant);
                window.location.href = '/checkout';
              }}>
                <Zap size={18} /> BUY NOW
              </button>
            </div>

            {/* Trust Features */}
            <div className="product-trust">
              <div className="trust-item"><Truck size={16} /> Free shipping above ₹500</div>
              <div className="trust-item"><RefreshCw size={16} /> 3-day return policy</div>
              <div className="trust-item"><Shield size={16} /> Secure checkout</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tabs-nav">
            <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
              Description
            </button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              Reviews ({product.reviewCount || 0})
            </button>
            <button className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>
              Shipping
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-panel">
                <p>{product.description}</p>
                {product.tags && (
                  <div className="product-tags">
                    <strong>Tags: </strong>
                    {product.tags.map(tag => (
                      <span key={tag} className="product-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="tab-panel">
                {reviews.length === 0 ? (
                  <p>No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="stars">{renderStars(review.rating)}</div>
                      <p>{review.text}</p>
                      <span className="review-author">- {review.userName}</span>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="tab-panel">
                <p><strong>Free Shipping</strong> on orders above ₹500</p>
                <p>Standard delivery: 5-7 business days</p>
                <p>Express delivery: 2-3 business days (additional charges apply)</p>
                <p>We ship pan-India through trusted courier partners.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-section">
            <h2 className="section-title">You May Also Like 💝</h2>
            <div className="product-grid">
              {relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
