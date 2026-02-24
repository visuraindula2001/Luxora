import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery } from '../features/api/apiSlice';
import ProductCard from '../components/product/ProductCard';
import './Home.css';

const Home = () => {
    const { data: featured = [], isLoading: loadingFeatured } = useGetFeaturedProductsQuery();
    const { data: categories = [], isLoading: loadingCategories } = useGetCategoriesQuery();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__bg" />
                <div className="container hero__content">
                    <div className="hero__text animate-slide-up">
                        <span className="hero__tag">✦ Premium Shopping Experience</span>
                        <h1 className="hero__title">
                            Discover <span className="text-gradient">Curated</span> Products for Modern Living
                        </h1>
                        <p className="hero__subtitle">
                            Explore our handpicked collection of premium products. From tech to fashion, find everything you need with fast shipping and secure checkout.
                        </p>
                        <div className="hero__actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link to="/products?featured=true" className="btn btn-outline btn-lg">
                                View Featured
                            </Link>
                        </div>
                    </div>
                    <div className="hero__visual animate-fade-in">
                        <div className="hero__orb hero__orb--1" />
                        <div className="hero__orb hero__orb--2" />
                        <div className="hero__orb hero__orb--3" />
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="trust-bar">
                <div className="container trust-bar__inner">
                    <div className="trust-bar__item"><FiTruck /> <span>Free Shipping over $100</span></div>
                    <div className="trust-bar__item"><FiShield /> <span>Secure Payment</span></div>
                    <div className="trust-bar__item"><FiRefreshCw /> <span>Easy Returns</span></div>
                    <div className="trust-bar__item"><FiHeadphones /> <span>24/7 Support</span></div>
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Shop by Category</h2>
                        <Link to="/products" className="section-link">View All <FiArrowRight /></Link>
                    </div>
                    <div className="categories-grid">
                        {categories.slice(0, 6).map((cat, i) => (
                            <Link to={`/products?category=${cat._id}`} key={cat._id} className="category-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="category-card__icon">{cat.name.charAt(0)}</div>
                                <h3 className="category-card__name">{cat.name}</h3>
                                <p className="category-card__desc">{cat.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Products</h2>
                        <Link to="/products?featured=true" className="section-link">View All <FiArrowRight /></Link>
                    </div>
                    {loadingFeatured ? (
                        <div className="product-grid">
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}
                        </div>
                    ) : (
                        <div className="product-grid">
                            {featured.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="section">
                <div className="container">
                    <div className="cta-banner">
                        <div className="cta-banner__content">
                            <h2>Get 10% Off Your First Order</h2>
                            <p>Use code <strong>WELCOME10</strong> at checkout</p>
                            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping <FiArrowRight /></Link>
                        </div>
                        <div className="cta-banner__glow" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
