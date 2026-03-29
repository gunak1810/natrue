'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProductBySlug, getProducts, getReviews } from '@/lib/firestore';
import { Star, Minus, Plus, ShoppingCart, Zap, Truck, RefreshCw, Shield, ChevronDown, Type, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import './product.css';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [customText, setCustomText] = useState('');
  const [customImageFile, setCustomImageFile] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const prod = await getProductBySlug(params.slug);
        setProduct(prod);
        
        // Auto-select first options for all variants
        if (prod && prod.variants) {
          const initialVars = {};
          prod.variants.forEach(v => {
            if (v.options && v.options.length > 0) {
              initialVars[v.name] = v.options[0];
            }
          });
          setSelectedVariants(initialVars);
        }

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

  let currentPrice = product.price;
  let currentSalePrice = product.salePrice || product.price;

  // Calculate dynamic price based on selected variants if variants contain custom pricing (e.g. Size config)
  if (product.variants) {
    product.variants.forEach(v => {
      const selected = selectedVariants[v.name];
      // Check if selected option is an object with a price
      if (selected && typeof selected === 'object' && selected.price !== undefined) {
        currentPrice = selected.price;
        currentSalePrice = selected.salePrice || selected.price;
      }
    });
  }

  const discount = currentSalePrice < currentPrice
    ? Math.round(((currentPrice - currentSalePrice) / currentPrice) * 100)
    : 0;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill={i < Math.round(rating) ? '#FFB800' : '#DDD'} color={i < Math.round(rating) ? '#FFB800' : '#DDD'} />
    ));
  };

  const handleAddToCart = (e) => {
    const rect = e?.currentTarget?.getBoundingClientRect() || null;
    const productToAdd = {
      ...product,
      price: currentPrice,
      salePrice: currentSalePrice
    };
    // Flatten variant object to string (e.g. "Color: Pink / Size: 10x10")
    const variantKeys = Object.keys(selectedVariants);
    let variantParts = variantKeys.length > 0 
      ? variantKeys.map(k => {
          const v = selectedVariants[k];
          return typeof v === 'object' ? `${k}: ${v.name}` : `${k}: ${v}`;
        })
      : [];
    
    // Append customization info to variant string
    if (product.customText && customText.trim()) {
      variantParts.push(`Text: "${customText.trim()}"`);
    }
    if (product.customImage && customImagePreview) {
      variantParts.push(`Custom Image: Yes`);
    }
    
    const variantString = variantParts.length > 0 ? variantParts.join(' | ') : null;

    addToCart(productToAdd, quantity, variantString, rect);
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
            <div className="product-main-image" style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f5f5f5', borderRadius: '16px', overflow: 'hidden' }}>
              {product.images?.[0] ? (
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  priority
                />
              ) : (
                <div className="product-img-large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '4rem' }}>🎁</div>
              )}
              {discount > 0 && <span className="product-badge badge-sale" style={{ position: 'absolute', top: 15, left: 15, zIndex: 10 }}>-{discount}%</span>}
            </div>
            
            {/* Optional Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="product-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                {product.images.map((img, i) => (
                  <div key={i} style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: i === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)' }}>
                     <Image src={img} alt={`${product.name} thumbnail ${i}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-rating">
                <div className="stars">{renderStars(product.rating || 0)}</div>
                <span className="rating-count">({product.reviewCount || 0} reviews)</span>
              </div>

              <div className="product-pricing">
                <span className="product-sale-price">₹{currentSalePrice}</span>
                {discount > 0 && (
                  <>
                    <span className="product-original-price">₹{currentPrice}</span>
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
                    {variant.options?.map((option, i) => {
                      const isObj = typeof option === 'object';
                      const optName = isObj ? option.name : option;
                      const selectedVal = selectedVariants[variant.name];
                      const isSelected = selectedVal && ((typeof selectedVal === 'object' && selectedVal.name === optName) || selectedVal === optName);
                      
                      return (
                        <button
                          key={i}
                          className={`variant-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                        >
                          {optName}
                          {isObj && option.price && (
                             <span style={{ display: 'block', fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>₹{option.salePrice || option.price}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Customization: Text */}
              {product.customText && (
                <div className="product-variant-group">
                  <label className="variant-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Type size={16} /> Add Your Custom Text:
                  </label>
                  <input 
                    type="text" 
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter personalized text (e.g. name, message)"
                    maxLength={50}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      background: 'white',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                    {customText.length}/50 characters
                  </span>
                </div>
              )}

              {/* Customization: Image Upload */}
              {product.customImage && (
                <div className="product-variant-group">
                  <label className="variant-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} /> Upload Your Image:
                  </label>
                  {customImagePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={customImagePreview} 
                        alt="Custom upload"
                        style={{ 
                          width: '120px', height: '120px', objectFit: 'cover', 
                          borderRadius: '12px', border: '2px solid var(--color-primary)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <button 
                        onClick={() => { setCustomImageFile(null); setCustomImagePreview(null); }}
                        style={{
                          position: 'absolute', top: '-8px', right: '-8px',
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: 'var(--color-error)', color: 'white',
                          border: '2px solid white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', padding: '24px', border: '2px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      background: 'var(--color-bg-section)', transition: 'all 0.2s',
                      minHeight: '100px'
                    }}>
                      <ImageIcon size={28} color="var(--color-text-muted)" />
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        Tap to upload your image
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        JPG, PNG, WebP (max 5MB)
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) { 
                              alert('Image must be under 5MB'); 
                              return; 
                            }
                            setCustomImageFile(file);
                            const reader = new FileReader();
                            reader.onload = (ev) => setCustomImagePreview(ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

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
                <button className="btn btn-outline-accent btn-lg btn-full" onClick={handleAddToCart}>
                  <ShoppingCart size={18} /> ADD TO CART
                </button>
                <button className="btn btn-accent btn-lg btn-full" onClick={(e) => {
                  handleAddToCart(e);
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
