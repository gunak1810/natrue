'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, updateUserProfile } from '@/lib/firestore';
import { CheckCircle, CreditCard, Banknote, ArrowRight } from 'lucide-react';

import Link from 'next/link';
import './checkout.css';

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  
  // OTP Verification state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [form, setForm] = useState({
    name: userProfile?.name || user?.displayName || '', 
    email: userProfile?.email || user?.email || '',
    phone: userProfile?.phone || '', 
    address: userProfile?.addresses?.[0]?.address || '', 
    city: userProfile?.addresses?.[0]?.city || '', 
    state: userProfile?.addresses?.[0]?.state || '', 
    pincode: userProfile?.addresses?.[0]?.pincode || '', 
    notes: ''
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) { 
      // OTP Verification Logic
      if (!phoneVerified) {
        if (!showOtp) {
          if (form.phone.length < 10) {
             alert('Please enter a valid 10-digit mobile number.');
             return;
          }
          setShowOtp(true);
          alert(`Test OTP sent to ${form.phone}. Please enter 1234 to verify.`);
          return;
        } else {
          if (otp === '1234') {
             setPhoneVerified(true);
             setShowOtp(false);
             setStep(2);
          } else {
             alert('Invalid OTP! Please enter 1234 for testing.');
             return;
          }
        }
      } else {
        setStep(2); 
      }
      return; 
    }
    
    try {
      setSubmitting(true);
      const orderData = {

        userId: user?.uid || 'guest',
        items: items.map(item => ({
          productId: item.id, name: item.name, price: item.price,
          quantity: item.quantity, variant: item.variant, image: item.image
        })),
        shippingAddress: form,
        subtotal, shipping: shippingCost, total,
        paymentMethod, status: 'pending'
      };
      const id = await createOrder(orderData);
      
      // Auto-save address to user profile if logged in
      if (user && userProfile) {
        const currentAddresses = userProfile.addresses || [];
        const isNewAddress = !currentAddresses.some(a => 
          a.address === form.address && a.pincode === form.pincode
        );
        if (isNewAddress) {
          await updateUserProfile(user.uid, {
            phone: form.phone,
            addresses: [...currentAddresses, {
              name: form.name, phone: form.phone, address: form.address, 
              city: form.city, state: form.state, pincode: form.pincode
            }]
          });
        }
      }

      setOrderId(id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Error placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }

  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="order-success">
            <CheckCircle size={80} color="#2ba79b" strokeWidth={1} />
            <h2 style={{ fontSize: '24px', margin: '20px 0 10px' }}>Your order is confirmed</h2>
            <p style={{ color: '#666' }}>ID: <span style={{ fontWeight: 600 }}>#{orderId.slice(0, 12).toUpperCase()}</span></p>
            <div style={{ margin: '30px 0', padding: '20px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'left' }}>
              <p style={{ fontSize: '14px', marginBottom: '10px' }}>We&#39;ve accepted your order and we&#39;re getting it ready. A confirmation email has been sent to <strong>{form.email}</strong>.</p>
            </div>
            <Link href="/" className="btn btn-primary btn-lg" style={{ background: '#2ba79b', border: 'none', width: '100%' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px' }}>Your cart is empty</h3>
          <Link href="/collections/all" className="btn btn-primary" style={{ background: '#2ba79b', border: 'none' }}>Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container-full">
        {/* Left: Main Column */}
        <div className="checkout-main">
          <div className="checkout-main-content">
            <header className="checkout-header">
              <Link href="/" className="checkout-logo">CraftsZone</Link>
            </header>

            <nav className="checkout-breadcrumbs">
              <span className="breadcrumb-item">Cart</span>
              <span><ArrowRight size={12} /></span>
              <span className={`breadcrumb-item ${step === 1 ? 'active' : ''}`}>Information</span>
              <span><ArrowRight size={12} /></span>
              <span className={`breadcrumb-item ${step === 2 ? 'active' : ''}`}>Payment</span>
            </nav>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="checkout-section">
                  <div className="checkout-section-header">
                    <h2 className="checkout-section-title">Shipping address</h2>
                    <span style={{ fontSize: '13px', color: '#666' }}>* required</span>
                  </div>
                  
                  <div className="checkout-field-row">
                    <div className="checkout-field">
                      <label className="checkout-field-label">Full Name</label>
                      <input className="checkout-field-input" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-field-label">Email</label>
                      <input className="checkout-field-input" type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="checkout-field-row">
                    <div className="checkout-field">
                      <label className="checkout-field-label">Phone</label>
                      <input className="checkout-field-input" name="phone" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-field-label">PIN code</label>
                      <input className="checkout-field-input" name="pincode" value={form.pincode} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="checkout-field" style={{ marginBottom: '15px' }}>
                    <label className="checkout-field-label">Address</label>
                    <input className="checkout-field-input" name="address" value={form.address} onChange={handleChange} required />
                  </div>

                  <div className="checkout-field-row">
                    <div className="checkout-field">
                      <label className="checkout-field-label">City</label>
                      <input className="checkout-field-input" name="city" value={form.city} onChange={handleChange} required />
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-field-label">State</label>
                      <input className="checkout-field-input" name="state" value={form.state} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="checkout-footer-nav">
                    <Link href="/cart" style={{ color: '#2ba79b', fontSize: '13px', textDecoration: 'none' }}>Back to cart</Link>
                    
                    {showOtp ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value)} 
                          placeholder="Enter 1234 OTP"
                          style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', width: '140px' }}
                          required
                        />
                        <button type="submit" className="btn-checkout-primary">Verify & Continue</button>
                      </div>
                    ) : (
                      <button type="submit" className="btn-checkout-primary">
                        {phoneVerified ? 'Continue to payment' : 'Verify Mobile Number'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="checkout-section fade-in">
                  <h2 className="checkout-section-title" style={{ marginBottom: '20px' }}>Payment</h2>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>All transactions are secure and encrypted.</p>
                  
                  <div className="payment-box">
                    <label className={`payment-method-item ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                      <input type="radio" value="cod" checked={paymentMethod === 'cod'} readOnly />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Cash on Delivery (COD)</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Pay in cash upon delivery.</div>
                      </div>
                      <Banknote size={20} color="#666" />
                    </label>
                    <label className={`payment-method-item ${paymentMethod === 'online' ? 'active' : ''}`} onClick={() => setPaymentMethod('online')}>
                      <input type="radio" value="online" checked={paymentMethod === 'online'} readOnly />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Online Payment</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>UPI, Cards, Wallets, etc.</div>
                      </div>
                      <CreditCard size={20} color="#666" />
                    </label>
                  </div>

                  <div className="checkout-footer-nav">
                    <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2ba79b', fontSize: '13px', cursor: 'pointer' }}>Back to shipping</button>
                    <button type="submit" className="btn-checkout-primary" disabled={submitting}>
                      {submitting ? 'Processing...' : 'Complete order'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <footer style={{ marginTop: '50px', paddingTop: '15px', borderTop: '1px solid #eee', fontSize: '11px', color: '#999', display: 'flex', gap: '15px' }}>
              <span>Refund policy</span>
              <span>Shipping policy</span>
              <span>Terms of service</span>
            </footer>
          </div>
        </div>

        {/* Right: Sidebar Sidebar */}
        <aside className="checkout-sidebar">
          <div className="checkout-sidebar-content">
            <div className="summary-items">
              {items.map(item => (
                <div key={item.key} className="summary-product">
                  <div className="summary-product-img">
                    {item.image ? <img src={item.image} alt={item.name} /> : '🎁'}
                    <span className="summary-product-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-product-info">
                    <span className="summary-product-name">{item.name}</span>
                    {item.variant && <span style={{ fontSize: '12px', color: '#666' }}>{item.variant}</span>}
                  </div>
                  <span className="summary-product-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>INR</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>


  );
}
