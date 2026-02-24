import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation } from '../features/api/apiSlice';
import Loader from '../components/common/Loader';
import './Cart.css';

const Cart = () => {
    const { user } = useSelector((s) => s.auth);
    const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !user });
    const [updateItem] = useUpdateCartItemMutation();
    const [removeItem] = useRemoveCartItemMutation();

    if (!user) return (
        <div className="section container cart-empty">
            <FiShoppingBag className="cart-empty__icon" />
            <h2>Sign in to view your cart</h2>
            <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
        </div>
    );

    if (isLoading) return <Loader />;

    const items = cart?.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal + shipping;

    return (
        <div className="section">
            <div className="container">
                <h1 className="page-title">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="cart-empty">
                        <FiShoppingBag className="cart-empty__icon" />
                        <h2>Your cart is empty</h2>
                        <p>Discover amazing products and add them to your cart</p>
                        <Link to="/products" className="btn btn-primary btn-lg">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {items.map((item) => (
                                <div key={item._id} className="cart-item card">
                                    <img src={item.product?.thumbnail || ''} alt={item.product?.name} className="cart-item__img" />
                                    <div className="cart-item__info">
                                        <Link to={`/products/${item.product?.slug}`} className="cart-item__name">{item.product?.name}</Link>
                                        <p className="cart-item__brand">{item.product?.brand}</p>
                                        {item.variant && Object.entries(item.variant).map(([k, v]) => (
                                            <span key={k} className="cart-item__variant">{k}: {v}</span>
                                        ))}
                                    </div>
                                    <div className="cart-item__price">${(item.product?.price || 0).toFixed(2)}</div>
                                    <div className="cart-item__qty">
                                        <button onClick={() => updateItem({ itemId: item._id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1}><FiMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateItem({ itemId: item._id, quantity: item.quantity + 1 })}><FiPlus /></button>
                                    </div>
                                    <div className="cart-item__total">${((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
                                    <button className="cart-item__remove" onClick={() => removeItem(item._id)}><FiTrash2 /></button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary card">
                            <h3>Order Summary</h3>
                            <div className="cart-summary__row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="cart-summary__row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                            {shipping > 0 && <p className="cart-summary__note">Free shipping on orders over $100</p>}
                            <hr />
                            <div className="cart-summary__row cart-summary__total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Proceed to Checkout <FiArrowRight /></Link>
                            <Link to="/products" className="btn btn-outline" style={{ width: '100%', marginTop: 'var(--space-2)' }}>Continue Shopping</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
