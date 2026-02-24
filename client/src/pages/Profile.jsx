import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiMapPin, FiPackage, FiHeart, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user } = useSelector((s) => s.auth);

    if (!user) return (
        <div className="section container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2>Please sign in to view your profile</h2>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: '20px' }}>Sign In</Link>
        </div>
    );

    return (
        <div className="section">
            <div className="container">
                <h1 className="page-title">My Account</h1>
                <div className="profile-layout">
                    {/* Profile Card */}
                    <div className="profile-card card">
                        <div className="profile-avatar">
                            {user.avatar ? <img src={user.avatar} alt={user.name} /> : <FiUser />}
                        </div>
                        <h2>{user.name}</h2>
                        <p><FiMail /> {user.email}</p>
                        {user.role === 'admin' && <span className="badge badge-primary">Admin</span>}
                    </div>

                    {/* Quick Links */}
                    <div className="profile-links">
                        <Link to="/orders" className="profile-link-card card">
                            <FiPackage className="profile-link-icon" />
                            <div>
                                <h3>My Orders</h3>
                                <p>View order history and tracking</p>
                            </div>
                        </Link>
                        <Link to="/wishlist" className="profile-link-card card">
                            <FiHeart className="profile-link-icon" />
                            <div>
                                <h3>Wishlist</h3>
                                <p>Your saved products</p>
                            </div>
                        </Link>
                        <Link to="/cart" className="profile-link-card card">
                            <FiMapPin className="profile-link-icon" />
                            <div>
                                <h3>Shopping Cart</h3>
                                <p>Review your cart items</p>
                            </div>
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="profile-link-card card">
                                <FiSettings className="profile-link-icon" />
                                <div>
                                    <h3>Admin Dashboard</h3>
                                    <p>Manage products, orders, users</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
