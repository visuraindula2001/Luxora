import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../features/api/apiSlice';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/common/Loader';

const Wishlist = () => {
    const { user } = useSelector((s) => s.auth);
    const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !user });

    if (!user) return (
        <div className="section container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <FiHeart style={{ fontSize: 64, color: 'var(--color-text-muted)' }} />
            <h2 style={{ marginTop: 16 }}>Sign in to view your wishlist</h2>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Sign In</Link>
        </div>
    );

    if (isLoading) return <Loader />;

    const items = data?.wishlist || [];

    return (
        <div className="section">
            <div className="container">
                <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-8)' }}>
                    My Wishlist ({items.length})
                </h1>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <FiHeart style={{ fontSize: 64, color: 'var(--color-text-muted)' }} />
                        <h2 style={{ marginTop: 16, marginBottom: 8 }}>Your wishlist is empty</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Browse products and save your favorites</p>
                        <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
                    </div>
                ) : (
                    <div className="product-grid">
                        {items.map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
