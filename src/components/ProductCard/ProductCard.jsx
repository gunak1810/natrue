'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/firestore';
import './ProductCard.css';


export default function ProductCard({ product }) {
  const { addToCart, items, updateQuantity } = useCart();
  const { user, userProfile } = useAuth();
  
  const isWishlisted = userProfile?.wishlist?.some(w => w.id === product.id) || false;

  const [selectedWeight, setSelectedWeight] = useState('250gm');
  const weights = ['250gm', '500gm', '750gm', '1kg'];
  const weightMultiplier = {
    '250gm': 1,
    '500gm': 2,
    '750gm': 3,
    '1kg': 4
  };

  const multiplier = weightMultiplier[selectedWeight];
  const currentSalePrice = (product.salePrice || product.price) * multiplier;
  const currentOriginalPrice = product.price * multiplier;

  // Find this product variant in the cart
  const cartItem = items.find(item => item.key === `${product.id}-${selectedWeight}` || (!item.variant && selectedWeight === '250gm' && item.id === product.id));
  const cartQty = cartItem ? cartItem.quantity : 0;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to use the wishlist.");
      return;
    }

    try {
      let currentWishlist = userProfile?.wishlist || [];
      if (isWishlisted) {
        currentWishlist = currentWishlist.filter(w => w.id !== product.id);
      } else {
        currentWishlist = [...currentWishlist, {
          id: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          image: product.image || product.images?.[0] || '',
          slug: product.slug
        }];
      }
      await updateUserProfile(user.uid, { wishlist: currentWishlist });
      alert(isWishlisted ? "Removed from wishlist!" : "Added to wishlist!");
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  const discount = product.salePrice < product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} size={13} fill="#FFB800" color="#FFB800" />);
      } else if (i === full && half) {
        stars.push(<Star key={i} size={13} fill="#FFB800" color="#FFB800" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} size={13} color="#DDD" />);
      }
    }
    return stars;
  };

  const handleMobileQtyChange = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.key, cartItem.quantity + delta);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const productToAdd = {
      ...product,
      price: product.price * multiplier,
      salePrice: product.salePrice ? product.salePrice * multiplier : null
    };
    addToCart(productToAdd, 1, selectedWeight, rect);
  };

  const bgColors = ['#f0fdf4', '#fefce8', '#fff1f2', '#eff6ff', '#fdf4ff'];
  const softBg = bgColors[product.id?.charCodeAt(0) % bgColors.length || 0];

  return (
    <div className="product-card glow-card">
      <div className="product-card-image" style={{ background: softBg }}>
        {/* Freshness / Category Badge */}
        <span className="product-category-badge">
          {product.category ? product.category.replace('-', ' ') : 'Organic'}
        </span>

        {(product.image || product.images?.[0]) ? (
          <Image 
            src={product.image || product.images[0]} 
            alt={product.name} 
            fill
            className="product-image-3d"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="product-img-placeholder">
            🎁
          </div>
        )}

        {discount > 0 && (
          <span className="product-badge badge-sale">-{discount}%</span>
        )}
        
        <button 
          className="wishlist-btn" 
          onClick={toggleWishlist}
          style={{ 
            position: 'absolute', top: 12, right: 12, zIndex: 5, 
            background: 'rgba(255,255,255,0.8)', 
            border: 'none', borderRadius: '50%', width: 34, height: 34, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
          aria-label="Toggle Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? "#c97b3d" : "none"} color={isWishlisted ? "#c97b3d" : "#666"} />
        </button>
        <div className="product-card-overlay">
          <button 
            className="quick-add-btn"
            onClick={handleAddToCart}
          >
            ADD TO CART
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <div className="product-card-title" style={{ cursor: 'default' }}>
          {product.name}
        </div>
        
        {/* Weight Variant Pills */}
        <div className="weight-pills">
          {weights.map(w => (
            <button
              key={w}
              className={`weight-pill ${selectedWeight === w ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedWeight(w);
              }}
            >
              {w}
            </button>
          ))}
        </div>

        {product.rating > 0 && (
          <div className="stars">
            {renderStars(product.rating)}
            <span className="count">({product.reviewCount})</span>
          </div>
        )}
        <div className="price-group">
          <span className="price-sale">₹{currentSalePrice}</span>
          {discount > 0 && <span className="price-original">₹{currentOriginalPrice}</span>}
        </div>

        {/* Mobile ADD button — Zepto/Instamart style */}
        {cartQty === 0 ? (
          <button className="mobile-add-btn" onClick={handleAddToCart}>
            ADD
          </button>
        ) : (
          <div className="mobile-qty-stepper">
            <button onClick={(e) => handleMobileQtyChange(e, -1)} aria-label="Decrease">
              <Minus size={16} />
            </button>
            <span>{cartQty}</span>
            <button onClick={(e) => handleMobileQtyChange(e, 1)} aria-label="Increase">
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

