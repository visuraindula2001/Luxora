import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiPackage, FiEye } from 'react-icons/fi';
import { useGetMyOrdersQuery } from '../features/api/apiSlice';
import Loader from '../components/common/Loader';
import './OrderHistory.css';

const statusColors = {
    pending: 'badge-warning',
    processing: 'badge-primary',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
};

const OrderHistory = () => {
    const { user } = useSelector((s) => s.auth);
    const { data, isLoading } = useGetMyOrdersQuery(undefined, { skip: !user });

    if (!user) return (
        <div className="section container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2>Please sign in to view your orders</h2>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Sign In</Link>
        </div>
    );

    if (isLoading) return <Loader />;

    const orders = data?.orders || data || [];

    return (
        <div className="section">
            <div className="container">
                <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-8)' }}>
                    Order History
                </h1>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <FiPackage style={{ fontSize: 64, color: 'var(--color-text-muted)' }} />
                        <h2 style={{ marginTop: 16, marginBottom: 8 }}>No orders yet</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Start shopping to see your orders here</p>
                        <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className="order-card card">
                                <div className="order-card__header">
                                    <div>
                                        <p className="order-card__id">Order #{order._id?.slice(-8).toUpperCase()}</p>
                                        <p className="order-card__date">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <span className={`badge ${statusColors[order.status] || 'badge-primary'}`}>{order.status}</span>
                                </div>

                                <div className="order-card__items">
                                    {order.items?.slice(0, 3).map((item, i) => (
                                        <div key={i} className="order-card__item">
                                            <img src={item.image || item.product?.thumbnail || ''} alt={item.name} />
                                            <div>
                                                <p className="order-card__item-name">{item.name}</p>
                                                <p className="order-card__item-qty">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && <p className="order-card__more">+{order.items.length - 3} more items</p>}
                                </div>

                                <div className="order-card__footer">
                                    <span className="order-card__total">Total: <strong>${order.totalPrice?.toFixed(2)}</strong></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
