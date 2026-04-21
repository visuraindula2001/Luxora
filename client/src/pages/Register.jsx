import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/auth/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [clientError, setClientError] = useState('');

    const { user, loading, error } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
        return () => dispatch(clearError());
    }, [user, navigate, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setClientError('Passwords do not match');
        if (password.length < 6) return setClientError('Password must be at least 6 characters');
        setClientError('');
        dispatch(registerUser({ name, email, password }));
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-header">
                    <span className="auth-logo">◆</span>
                    <h1>Create Account</h1>
                    <p>Join Luxora for premium shopping</p>
                </div>

                {(error || clientError) && <div className="auth-error">{clientError || error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label><FiUser /> Full Name</label>
                        <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="input-group">
                        <label><FiMail /> Email</label>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div className="input-group">
                        <label><FiLock /> Password</label>
                        <div className="auth-password-wrapper">
                            <input type={showPassword ? 'text' : 'password'} className="input" value={password}
                                onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <div className="input-group">
                        <label><FiLock /> Confirm Password</label>
                        <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-divider"><span>or continue with</span></div>

                <a href="/api/auth/google" className="btn btn-secondary btn-lg auth-google">
                    <FcGoogle /> Google
                </a>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
