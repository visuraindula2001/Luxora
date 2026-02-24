import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    {/* Brand */}
                    <div className="footer__brand">
                        <Link to="/" className="footer__logo">
                            <span className="footer__logo-icon">◆</span> Luxora
                        </Link>
                        <p className="footer__desc">
                            Premium shopping experience with curated products, fast checkout, and personalized recommendations.
                        </p>
                        <div className="footer__socials">
                            <a href="#" aria-label="GitHub"><FaGithub /></a>
                            <a href="#" aria-label="Twitter"><FaTwitter /></a>
                            <a href="#" aria-label="Instagram"><FaInstagram /></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="footer__col">
                        <h4>Shop</h4>
                        <Link to="/products">All Products</Link>
                        <Link to="/products?featured=true">Featured</Link>
                        <Link to="/products?sort=-createdAt">New Arrivals</Link>
                        <Link to="/products?sort=price">Best Deals</Link>
                    </div>

                    <div className="footer__col">
                        <h4>Account</h4>
                        <Link to="/profile">My Profile</Link>
                        <Link to="/orders">Order History</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart">Shopping Cart</Link>
                    </div>

                    <div className="footer__col">
                        <h4>Contact</h4>
                        <a href="mailto:support@luxora.com"><FiMail /> support@luxora.com</a>
                        <a href="tel:+1234567890"><FiPhone /> +1 (234) 567-890</a>
                        <span><FiMapPin /> San Francisco, CA</span>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>© {new Date().getFullYear()} Luxora. All rights reserved.</p>
                    <div className="footer__bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
