'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import './ProductCard.css';


export default function ProductCard({ product }) {
  const { addToCart } = useCart();
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
