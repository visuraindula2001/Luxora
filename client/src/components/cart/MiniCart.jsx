import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { closeCart } from '../../features/cart/cartSlice';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation } from '../../features/api/apiSlice';
import './MiniCart.css';

const MiniCart = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !user });
    const [updateItem] = useUpdateCartItemMutation();
    const [removeItem] = useRemoveCartItemMutation();

    const items = cart?.items || [];
    const total = items.reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0);

    return (
        <>
            <div className="minicart-overlay" onClick={() => dispatch(closeCart())} />
            <div className="minicart animate-fade-in">
                <div className="minicart__header">
                    <h3>Shopping Cart ({items.length})</h3>
                    <button onClick={() => dispatch(closeCart())} className="minicart__close"><FiX /></button>
                </div>

                <div className="minicart__items">
                    {!user ? (
                        <div className="minicart__empty">
                            <p>Sign in to view your cart</p>
                            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => dispatch(closeCart())}>Sign In</Link>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="minicart__empty">
                            <p>Your cart is empty</p>
                            <Link to="/products" className="btn btn-primary btn-sm" onClick={() => dispatch(closeCart())}>Shop Now</Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item._id} className="minicart__item">
                                <img src={item.product?.thumbnail || ''} alt={item.product?.name} className="minicart__item-img" />
                                <div className="minicart__item-info">
                                    <Link to={`/products/${item.product?.slug}`} onClick={() => dispatch(closeCart())} className="minicart__item-name">
                                        {item.product?.name}
                                    </Link>
                                    <p className="minicart__item-price">${(item.product?.price || item.price).toFixed(2)}</p>
                                    <div className="minicart__qty">
                                        <button onClick={() => updateItem({ itemId: item._id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1}><FiMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateItem({ itemId: item._id, quantity: item.quantity + 1 })}><FiPlus /></button>
                                        <button className="minicart__remove" onClick={() => removeItem(item._id)}><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="minicart__footer">
                        <div className="minicart__total">
                            <span>Subtotal</span>
                            <span className="minicart__total-price">${total.toFixed(2)}</span>
                        </div>
                        <Link to="/cart" className="btn btn-secondary btn-lg" onClick={() => dispatch(closeCart())} style={{ width: '100%' }}>
                            View Cart
                        </Link>
                        <Link to="/checkout" className="btn btn-primary btn-lg" onClick={() => dispatch(closeCart())} style={{ width: '100%' }}>
                            Checkout <FiArrowRight />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default MiniCart;
