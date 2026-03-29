'use client';

import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, totalItems, subtotal, freeShippingThreshold } = useCart();
  const remaining = freeShippingThreshold - subtotal;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <>
      {isOpen && <div className="overlay active" onClick={() => setIsOpen(false)} />}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3><ShoppingBag size={20} /> Your Cart ({totalItems} items)</h3>
          <button onClick={() => setIsOpen(false)} className="cart-drawer-close" aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="shipping-progress">
          {remaining > 0 ? (
            <p>Spend <strong>₹{remaining}</strong> more for <strong>FREE shipping!</strong></p>
          ) : (
            <p className="shipping-free">🎉 Congratulations! You qualify for <strong>FREE shipping!</strong></p>
          )}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={50} />
              <p>Your cart is empty</p>
              <Link href="/collections/all" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} className="cart-item">
                <div className="cart-item-image">
                  <div className="cart-item-img-placeholder" style={{ background: `linear-gradient(135deg, var(--color-primary-bg), var(--color-bg-section))` }}>
                    🎁
                  </div>
                </div>
                <div className="cart-item-info">
                  <Link href={`/products/${item.slug}`} className="cart-item-name" onClick={() => setIsOpen(false)}>
                    {item.name}
                  </Link>
                  {item.variant && <span className="cart-item-variant">{item.variant}</span>}
                  <div className="cart-item-price">
                    <span className="price-sale">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="price-original">₹{item.originalPrice}</span>
                    )}
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.key)} aria-label="Remove item">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Subtotal:</span>
              <span className="cart-subtotal-price">₹{subtotal}</span>
            </div>
            <p className="cart-shipping-note">Shipping calculated at checkout.</p>
            <Link href="/cart" className="btn btn-outline-accent btn-full" onClick={() => setIsOpen(false)}>
              View Cart
            </Link>
            <Link href="/checkout" className="btn btn-accent btn-full" onClick={() => setIsOpen(false)}>
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
