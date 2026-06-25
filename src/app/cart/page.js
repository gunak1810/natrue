'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import './cart.css';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, shippingCost, total, freeShippingThreshold } = useCart();
  const remaining = freeShippingThreshold - subtotal;

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon-wrapper">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ color: 'var(--color-primary)' }}
            >
              <path d="M4 7l.867 12.142A2 2 0 0 0 6.861 21h10.278a2 2 0 0 0 1.994-1.858L20 7H4z"></path>
              <path d="M9 11v5"></path>
              <path d="M15 11v5"></path>
              <path d="M19 7a5.5 5.5 0 0 0-11-2"></path>
            </svg>
          </div>
          <h3>Your basket is empty</h3>
          <p>Looks like you haven&#39;t added any organic goodness yet</p>
          <Link href="/collections/all" className="btn btn-primary btn-lg" style={{ borderRadius: '100px' }}>
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        
        {remaining > 0 && (
          <div className="cart-shipping-banner">
            Spend <strong>₹{remaining}</strong> more for <strong>FREE shipping!</strong>
          </div>
        )}

        <div className="cart-layout">
          <div className="cart-items-list">
            <div className="cart-table-header">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>
            {items.map(item => (
              <div key={item.key} className="cart-row">
                <div className="cart-row-product">
                  <div className="cart-row-img">🎁</div>
                  <div>
                    <Link href={`/products/${item.slug}`} className="cart-row-name">{item.name}</Link>
                    {item.variant && <span className="cart-row-variant">{item.variant}</span>}
                  </div>
                </div>
                <div className="cart-row-price">
                  <span className="price-sale">₹{item.price}</span>
                  {item.originalPrice > item.price && <span className="price-original">₹{item.originalPrice}</span>}
                </div>
                <div className="cart-row-qty">
                  <div className="qty-selector">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className="cart-row-total">
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
                <div className="cart-row-remove">
                  <button onClick={() => removeFromCart(item.key)} aria-label="Remove"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingCost}`}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <Link href="/checkout" className="btn btn-accent btn-lg btn-full">
              Proceed to Checkout
            </Link>
            <Link href="/collections/all" className="btn btn-outline btn-full">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
