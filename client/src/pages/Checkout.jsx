import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiCreditCard, FiMapPin, FiPackage, FiLock } from 'react-icons/fi';
import { useGetCartQuery, useCreateOrderMutation, useValidateCouponMutation } from '../features/api/apiSlice';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const { user } = useSelector((s) => s.auth);
    const navigate = useNavigate();
    const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !user });
    const [createOrder, { isLoading: ordering }] = useCreateOrderMutation();
    const [validateCoupon] = useValidateCouponMutation();

    const [shipping, setShipping] = useState({ fullName: '', address: '', city: '', state: '', zipCode: '', country: 'US', phone: '' });
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);

    if (!user) return <div className="section container" style={{ textAlign: 'center' }}><h2>Please sign in</h2><Link to="/login" className="btn btn-primary" style={{ marginTop: 20 }}>Sign In</Link></div>;
    if (isLoading) return <Loader />;

    const items = cart?.items || [];
    const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax - discount;

    const handleShippingChange = (e) => setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await validateCoupon({ code: couponCode, cartTotal: subtotal }).unwrap();
            setDiscount(res.discount || 0);
            setCouponApplied(true);
            toast.success(`Coupon applied! -$${(res.discount || 0).toFixed(2)}`);
        } catch (err) { toast.error(err?.data?.message || 'Invalid coupon'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.zipCode) {
            return toast.error('Please fill in all shipping details');
        }
        try {
            const order = await createOrder({
                shippingAddress: shipping,
                couponCode: couponApplied ? couponCode : undefined,
            }).unwrap();
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (err) { toast.error(err?.data?.message || 'Order failed'); }
    };

    if (items.length === 0) return (
        <div className="section container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2>Your cart is empty</h2>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Shop Now</Link>
        </div>
    );

    return (
        <div className="section">
            <div className="container">
                <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-8)' }}>Checkout</h1>
                <form className="checkout-layout" onSubmit={handleSubmit}>
                    <div className="checkout-main">
                        {/* Shipping */}
                        <div className="checkout-section card">
                            <h3><FiMapPin /> Shipping Address</h3>
                            <div className="checkout-form-grid">
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Full Name</label>
                                    <input className="input" name="fullName" value={shipping.fullName} onChange={handleShippingChange} required />
                                </div>
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Street Address</label>
                                    <input className="input" name="address" value={shipping.address} onChange={handleShippingChange} required />
                                </div>
                                <div className="input-group"><label>City</label><input className="input" name="city" value={shipping.city} onChange={handleShippingChange} required /></div>
                                <div className="input-group"><label>State</label><input className="input" name="state" value={shipping.state} onChange={handleShippingChange} /></div>
                                <div className="input-group"><label>ZIP Code</label><input className="input" name="zipCode" value={shipping.zipCode} onChange={handleShippingChange} required /></div>
                                <div className="input-group"><label>Phone</label><input className="input" name="phone" value={shipping.phone} onChange={handleShippingChange} /></div>
                            </div>
                        </div>

                        {/* Review Items */}
                        <div className="checkout-section card">
                            <h3><FiPackage /> Order Items ({items.length})</h3>
                            {items.map(item => (
                                <div key={item._id} className="checkout-item">
                                    <img src={item.product?.thumbnail || ''} alt={item.product?.name} />
                                    <div>
                                        <p className="checkout-item__name">{item.product?.name}</p>
                                        <p className="checkout-item__qty">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="checkout-item__price">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="checkout-sidebar">
                        <div className="checkout-section card">
                            <h3>Order Summary</h3>
                            <div className="checkout-summary">
                                <div className="checkout-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="checkout-row"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span></div>
                                <div className="checkout-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                                {discount > 0 && <div className="checkout-row" style={{ color: 'var(--color-success)' }}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}

                                {/* Coupon */}
                                {!couponApplied && (
                                    <div className="checkout-coupon">
                                        <input className="input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCoupon}>Apply</button>
                                    </div>
                                )}

                                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-3) 0' }} />
                                <div className="checkout-row checkout-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={ordering} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                                <FiLock /> {ordering ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                                <FiCreditCard style={{ verticalAlign: 'middle' }} /> Secure payment powered by Stripe
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
