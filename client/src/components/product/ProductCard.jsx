import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useAddToCartMutation, useAddToWishlistMutation } from '../../features/api/apiSlice';
import { openCart } from '../../features/cart/cartSlice';
import StarRating from '../common/StarRating';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [addToCart] = useAddToCartMutation();
    const [addToWishlist] = useAddToWishlistMutation();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please sign in to add to cart');
        try {
            await addToCart({ productId: product._id }).unwrap();
            toast.success('Added to cart!');
            dispatch(openCart());
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to add to cart');
        }
    };

    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please sign in');
        try {
            await addToWishlist(product._id).unwrap();
            toast.success('Added to wishlist!');
        } catch (err) {
            toast.error(err?.data?.message || 'Already in wishlist');
        }
    };

    const discountPercent = product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return (
        <Link to={`/products/${product.slug}`} className="product-card card">
            <div className="product-card__image-wrapper">
                <img
                    src={product.thumbnail || product.images?.[0]?.url || '/placeholder.svg'}
                    alt={product.name}
                    className="product-card__image"
                    loading="lazy"
                />
                {discountPercent > 0 && (
                    <span className="product-card__badge badge badge-danger">-{discountPercent}%</span>
                )}
                <div className="product-card__actions">
                    <button className="product-card__action-btn" onClick={handleAddToWishlist} aria-label="Add to wishlist">
                        <FiHeart />
                    </button>
                    <button className="product-card__action-btn" onClick={handleAddToCart} aria-label="Add to cart">
                        <FiShoppingCart />
                    </button>
                </div>
            </div>

            <div className="product-card__info">
                <p className="product-card__brand">{product.brand}</p>
                <h3 className="product-card__name">{product.name}</h3>
                <StarRating rating={product.rating} count={product.numReviews} size={12} />
                <div className="product-card__price-row">
                    <span className="product-card__price">${product.price.toFixed(2)}</span>
                    {product.compareAtPrice > product.price && (
                        <span className="product-card__compare-price">${product.compareAtPrice.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
