import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FiMenu, FiX, FiLogOut, FiUsers, FiBox, FiBarChart3, FiHome } from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="admin-layout">
            {/* Admin Sidebar */}
            <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="admin-sidebar-header">
                    <h2>◆ Admin</h2>
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-item">
                        <FiBarChart3 /> Dashboard
                    </Link>
                    <Link to="/admin/users" className="admin-nav-item">
                        <FiUsers /> Users Management
                    </Link>
                    <Link to="/admin/products" className="admin-nav-item">
                        <FiBox /> Products
                    </Link>
                    <Link to="/" className="admin-nav-item">
                        <FiHome /> Back to Store
                    </Link>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <p className="admin-user-name">{user?.name}</p>
                        <p className="admin-user-role">{user?.role}</p>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </div>

            {/* Admin Content */}
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;