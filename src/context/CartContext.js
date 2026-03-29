'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGoalScored, setIsGoalScored] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const { user } = useAuth();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    async function loadCart() {
      if (user) {
        try {
          const docRef = doc(db, 'carts', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setItems(docSnap.data().items || []);
          } else {
            // New user, check if they have a local cart they want to keep
            const saved = localStorage.getItem('craftszone-cart');
            if (saved) {
              const parsed = JSON.parse(saved);
              setItems(parsed);
              if (parsed.length > 0) {
                await setDoc(docRef, { items: parsed });
              }
            }
          }
        } catch (e) {
          console.error('Error loading cart from Firebase:', e);
        }
      } else {
        // Guest mode
        const saved = localStorage.getItem('craftszone-cart');
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch (e) {
            console.error('Error loading cart:', e);
          }
        }
      }
      // slight delay to prevent initial state flush
      setTimeout(() => { isInitialLoad.current = false; }, 100);
    }
    loadCart();
  }, [user]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    
    localStorage.setItem('craftszone-cart', JSON.stringify(items));

    if (user) {
      const syncToFirebase = async () => {
        try {
          await setDoc(doc(db, 'carts', user.uid), { items });
        } catch (e) {
          console.error('Error saving cart to Firebase:', e);
        }
      };
      syncToFirebase();
    }
  }, [items, user]);

  const addToCart = useCallback((product, quantity = 1, variant = null, rect = null) => {
    setItems(prev => {
      const key = variant ? `${product.id}-${variant}` : product.id;
      const existing = prev.find(item => item.key === key);
      
      if (existing) {
        return prev.map(item => 
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      
      return [...prev, {
        key,
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.salePrice || product.price,
        originalPrice: product.price,
        image: product.images?.[0] || '/images/placeholder.jpg',
        variant,
        quantity
      }];
    });
    
    // Animation Logic
    if (rect) {
      try {
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        
        const ball = document.createElement('div');
        ball.innerHTML = '⚽';
        ball.style.position = 'fixed';
        ball.style.left = `${startX}px`;
        ball.style.top = `${startY}px`;
        ball.style.fontSize = '26px';
        ball.style.zIndex = '99999';
        ball.style.pointerEvents = 'none';
        ball.style.transition = 'all 1.5s cubic-bezier(0.1, 0.5, 0.4, 1.2)';
        ball.style.transform = 'translate(-50%, -50%)';
        ball.style.filter = 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))';
        document.body.appendChild(ball);

        // Force a reflow
        ball.offsetHeight;

        let targetCart = document.querySelector('.floating-mobile-cart');
        if (!targetCart || window.getComputedStyle(targetCart).display === 'none') {
           targetCart = document.querySelector('.cart-btn');
        }
        
        if (targetCart) {
          const targetRect = targetCart.getBoundingClientRect();
          ball.style.left = `${targetRect.left + targetRect.width / 2}px`;
          ball.style.top = `${targetRect.top + targetRect.height / 2}px`;
          ball.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(1440deg)';
        } else {
          // Fallback if no cart found
          ball.style.top = '-100px';
          ball.style.opacity = '0';
        }

        setTimeout(() => {
          ball.remove();
          setAddedCount(quantity);
          setIsGoalScored(true);
          setTimeout(() => {
            setIsGoalScored(false);
          }, 2000); 
        }, 1500);
      } catch (err) {
        console.error("Cart animation failed", err);
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  }, []);

  const removeFromCart = useCallback((key) => {
    setItems(prev => prev.filter(item => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setItems(prev => prev.map(item => 
      item.key === key ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = 500;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 49;
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, subtotal, shippingCost, total, freeShippingThreshold,
      isGoalScored, addedCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
