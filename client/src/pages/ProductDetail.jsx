import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiCheck, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useGetProductBySlugQuery, useAddToCartMutation, useAddToWishlistMutation, useGetProductReviewsQuery, useCreateReviewMutation } from '../features/api/apiSlice';
import { openCart } from '../features/cart/cartSlice';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const { data: product, isLoading } = useGetProductBySlugQuery(slug);
    const { data: reviewsData } = useGetProductReviewsQuery({ productId: product?._id }, { skip: !product?._id });
    const [addToCart, { isLoading: addingCart }] = useAddToCartMutation();
    const [addToWishlist] = useAddToWishlistMutation();
    const [createReview] = useCreateReviewMutation();

    // Build a deduplicated image list: thumbnail first, then gallery images
    const allImages = (() => {
        const list = [];
        if (product?.thumbnail) list.push({ url: product.thumbnail, alt: product?.name });
        (product?.images || []).forEach(img => {
            if (!list.some(x => x.url === img.url)) list.push({ url: img.url, alt: img.alt || product?.name });
        });
        return list.length ? list : [{ url: '/placeholder.jpg', alt: product?.name }];
    })();

    const [selectedImage, setSelectedImage] = useState(0);
    const [fading, setFading] = useState(false);

    const switchImage = useCallback((idx) => {
        if (idx === selectedImage) return;
        setFading(true);
        setTimeout(() => {
            setSelectedImage(idx);
            setFading(false);
        }, 160);
    }, [selectedImage]);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Keyboard navigation (Must be before any early returns)
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') switchImage((selectedImage - 1 + allImages.length) % allImages.length);
            if (e.key === 'ArrowRight') switchImage((selectedImage + 1) % allImages.length);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedImage, allImages.length, switchImage]);

    if (isLoading) return <Loader />;
    if (!product) return <div className="container section"><h2>Product not found</h2></div>;

    const handleAddToCart = async () => {
        if (!user) return toast.error('Please sign in');
        try {
            await addToCart({ productId: product._id, quantity, variant: selectedVariants }).unwrap();
            toast.success('Added to cart!');
            dispatch(openCart());
        } catch (err) {
            toast.error(err?.data?.message || 'Failed');
        }
    };

    const handleWishlist = async () => {
        if (!user) return toast.error('Please sign in');
        try {
            await addToWishlist(product._id).unwrap();
            toast.success('Added to wishlist!');
        } catch (err) { toast.error(err?.data?.message || 'Error'); }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        try {
            await createReview({ product: product._id, rating: reviewRating, comment: reviewText }).unwrap();
            toast.success('Review submitted!');
            setShowReviewForm(false);
            setReviewText('');
        } catch (err) { toast.error(err?.data?.message || 'Error'); }
    };

    const calcAppPrice = product.compareAtPrice || 0;
    const calcPrice = product.price || 0;
    const discount = calcAppPrice > calcPrice
        ? Math.round(((calcAppPrice - calcPrice) / calcAppPrice) * 100) : 0;

    const reviews = reviewsData?.reviews || [];

    return (
        <div className="pdp section">
            <div className="container">
                <div className="pdp__layout">
                    {/* Image Gallery */}
                    <div className="pdp__gallery">
                        {/* Vertical thumbnail strip */}
                        {allImages.length > 1 && (
                            <div className="pdp__thumbs">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`pdp__thumb ${i === selectedImage ? 'pdp__thumb--active' : ''}`}
                                        onClick={() => switchImage(i)}
                                        title={`View image ${i + 1}`}
                                    >
                                        <img src={img.url} alt={img.alt || `${product.name} ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main image + arrows */}
                        <div className="pdp__main-image">
                            <img
                                src={allImages[selectedImage]?.url}
                                alt={allImages[selectedImage]?.alt || product.name}
                                className={fading ? 'pdp__main-img--fade' : 'pdp__main-img--visible'}
                            />
                            {discount > 0 && <span className="badge badge-danger pdp__badge">-{discount}%</span>}

                            {/* Arrow navigation — only when multiple images */}
                            {allImages.length > 1 && (
                                <>
                                    <button className="pdp__arrow pdp__arrow--prev"
                                        onClick={() => switchImage((selectedImage - 1 + allImages.length) % allImages.length)}
                                        aria-label="Previous image">
                                        <FiChevronLeft />
                                    </button>
                                    <button className="pdp__arrow pdp__arrow--next"
                                        onClick={() => switchImage((selectedImage + 1) % allImages.length)}
                                        aria-label="Next image">
                                        <FiChevronRight />
                                    </button>
                                    <div className="pdp__dots">
                                        {allImages.map((_, i) => (
                                            <button key={i}
                                                className={`pdp__dot ${i === selectedImage ? 'pdp__dot--active' : ''}`}
                                                onClick={() => switchImage(i)}
                                                aria-label={`Image ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="pdp__info">
                        <p className="pdp__brand">{product.brand}</p>
                        <h1 className="pdp__name">{product.name}</h1>
                        <div className="pdp__rating-row">
                            <StarRating rating={product.rating} count={product.numReviews} />
                            {product.stock > 0 ? (
                                <span className="badge badge-success"><FiCheck /> In Stock</span>
                            ) : (
                                <span className="badge badge-danger">Out of Stock</span>
                            )}
                        </div>

                        <div className="pdp__price-row">
                            <span className="pdp__price">${(product.price || 0).toFixed(2)}</span>
                            {product.compareAtPrice > (product.price || 0) && (
                                <span className="pdp__compare">${(product.compareAtPrice || 0).toFixed(2)}</span>
                            )}
                            {discount > 0 && <span className="pdp__save">Save {discount}%</span>}
                        </div>

                        <p className="pdp__description">{product.description}</p>

                        {/* Variants */}
                        {(product.variants || []).map((variant) => (
                            <div key={variant.name} className="pdp__variant">
                                <h4>{variant.name}</h4>
                                <div className="pdp__variant-options">
                                    {(variant.options || []).map((opt) => (
                                        <button key={opt.value}
                                            className={`pdp__variant-btn ${selectedVariants[variant.name] === opt.value ? 'pdp__variant-btn--active' : ''}`}
                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt.value }))}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Quantity & Actions */}
                        <div className="pdp__actions">
                            <div className="pdp__qty">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><FiMinus /></button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)}><FiPlus /></button>
                            </div>
                            <button className="btn btn-primary btn-lg pdp__add-btn" onClick={handleAddToCart} disabled={addingCart || product.stock === 0}>
                                <FiShoppingCart /> {addingCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button className="btn btn-outline pdp__wish-btn" onClick={handleWishlist}><FiHeart /></button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pdp__trust">
                            <div><FiTruck /> Free shipping over $100</div>
                            <div><FiShield /> 2-year warranty</div>
                            <div><FiRefreshCw /> 30-day returns</div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="pdp__reviews">
                    <div className="pdp__reviews-header">
                        <h2>Reviews ({product.numReviews})</h2>
                        {user && <button className="btn btn-secondary" onClick={() => setShowReviewForm(!showReviewForm)}>Write a Review</button>}
                    </div>

                    {showReviewForm && (
                        <form className="pdp__review-form card" onSubmit={handleReview}>
                            <div className="input-group">
                                <label>Rating</label>
                                <select className="input" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Comment</label>
                                <textarea className="input" rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..." />
                            </div>
                            <button type="submit" className="btn btn-primary">Submit Review</button>
                        </form>
                    )}

                    <div className="pdp__reviews-list">
                        {reviews.map((r) => (
                            <div key={r._id} className="pdp__review card">
                                <div className="pdp__review-header">
                                    <strong>{r.user?.name || 'User'}</strong>
                                    <StarRating rating={r.rating} showCount={false} size={12} />
                                    {r.verified && <span className="badge badge-success">Verified</span>}
                                </div>
                                <p>{r.comment}</p>
                                <span className="pdp__review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
