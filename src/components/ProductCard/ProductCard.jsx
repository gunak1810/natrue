'use client';

import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/firestore';
import './ProductCard.css';


export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user, userProfile } = useAuth();
  
  const isWishlisted = userProfile?.wishlist?.some(w => w.id === product.id) || false;

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
          image: product.images?.[0] || '',
          slug: product.slug
        }];
      }
      await updateUserProfile(user.uid, { wishlist: currentWishlist });
      // Temporary alert for visual feedback without full context store sync for the specific button
      alert(isWishlisted ? "Removed from wishlist!" : "Added to wishlist!");
      // Note: Full UI sync will happen on refresh or next Firebase re-auth cycle
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

  return (
    <div className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card-image">
        {product.images?.[0] ? (
          <Image 
            src={product.images[0]} 
            alt={product.name} 
            fill 
            style={{ objectFit: 'cover' }}
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
          <Heart size={18} fill={isWishlisted ? "#ec4899" : "none"} color={isWishlisted ? "#ec4899" : "#666"} />
        </button>
        <div className="product-card-overlay">
          <button 
            className="quick-add-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
          >
            ADD TO CART
          </button>
        </div>
      </Link>
      <div className="product-card-info">
        <Link href={`/products/${product.slug}`} className="product-card-title">
          {product.name}
        </Link>
        {product.rating > 0 && (
          <div className="stars">
            {renderStars(product.rating)}
            <span className="count">({product.reviewCount})</span>
          </div>
        )}
        <div className="price-group">
          <span className="price-sale">₹{product.salePrice || product.price}</span>
          {discount > 0 && <span className="price-original">₹{product.price}</span>}
        </div>
      </div>
    </div>
  );
}
