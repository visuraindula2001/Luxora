import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/auth/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { user, loading, error } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
        return () => dispatch(clearError());
    }, [user, navigate, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-header">
                    <span className="auth-logo">◆</span>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue shopping</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label><FiMail /> Email</label>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div className="input-group">
                        <label><FiLock /> Password</label>
                        <div className="auth-password-wrapper">
                            <input type={showPassword ? 'text' : 'password'} className="input" value={password}
                                onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
                            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-options">
                        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider"><span>or continue with</span></div>

                <a href="http://localhost:5000/api/auth/google" className="btn btn-secondary btn-lg auth-google">
                    <FcGoogle /> Google
                </a>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
