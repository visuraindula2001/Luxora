import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiGrid } from 'react-icons/fi';
import { logout } from '../../features/auth/authSlice';
import { toggleCart } from '../../features/cart/cartSlice';
import { useGetCartQuery, useSearchProductsQuery } from '../../features/api/apiSlice';
import MiniCart from '../cart/MiniCart';
import './Header.css';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { isCartOpen } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: cart } = useGetCartQuery(undefined, { skip: !user });
    const { data: suggestions } = useSearchProductsQuery(searchQuery, { skip: searchQuery.length < 2 });

    const cartItemCount = cart?.items?.length || 0;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    return (
        <>
            <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
                <div className="container header__inner">
                    {/* Logo */}
                    <Link to="/" className="header__logo">
                        <span className="header__logo-icon">◆</span>
                        <span className="header__logo-text">Luxora</span>
                    </Link>

                    {/* Navigation */}
                    <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
                        <Link to="/products" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                        <Link to="/products?featured=true" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>Featured</Link>
                        <Link to="/products?sort=-createdAt" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
                        <Link to="/products?sort=price" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>Deals</Link>
                    </nav>

                    {/* Actions */}
                    <div className="header__actions">
                        {/* Search */}
                        <div className="header__search-wrapper" ref={searchRef}>
                            <button className="header__icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
                                <FiSearch />
                            </button>
                            {showSearch && (
                                <div className="header__search-dropdown animate-fade-in">
                                    <form onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            className="header__search-input"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </form>
                                    {suggestions && suggestions.length > 0 && (
                                        <div className="header__suggestions">
                                            {suggestions.map((p) => (
                                                <Link key={p._id} to={`/products/${p.slug}`} className="header__suggestion-item"
                                                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                                                    <img src={p.thumbnail} alt={p.name} className="header__suggestion-img" />
                                                    <div>
                                                        <p className="header__suggestion-name">{p.name}</p>
                                                        <p className="header__suggestion-price">${p.price.toFixed(2)}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {user && (
                            <Link to="/wishlist" className="header__icon-btn" aria-label="Wishlist">
                                <FiHeart />
                            </Link>
                        )}

                        {/* Cart */}
                        <button className="header__icon-btn header__cart-btn" onClick={() => dispatch(toggleCart())} aria-label="Cart">
                            <FiShoppingCart />
                            {cartItemCount > 0 && <span className="header__cart-badge">{cartItemCount}</span>}
                        </button>

                        {/* User */}
                        {user ? (
                            <div className="header__user-wrapper" ref={userMenuRef}>
                                <button className="header__icon-btn header__avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : <FiUser />}
                                </button>
                                {showUserMenu && (
                                    <div className="header__user-menu animate-fade-in">
                                        <p className="header__user-name">{user.name}</p>
                                        <p className="header__user-email">{user.email}</p>
                                        <hr />
                                        <Link to="/profile" onClick={() => setShowUserMenu(false)}><FiUser /> Profile</Link>
                                        <Link to="/orders" onClick={() => setShowUserMenu(false)}><FiPackage /> Orders</Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setShowUserMenu(false)}><FiGrid /> Admin</Link>
                                        )}
                                        <button onClick={() => { dispatch(logout()); setShowUserMenu(false); }}>
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                        )}

                        {/* Mobile menu toggle */}
                        <button className="header__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mini Cart Drawer */}
            {isCartOpen && <MiniCart />}
        </>
    );
};

export default Header;
