import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import Loader from '../components/common/Loader';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setError('No authentication token received');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            // Decode JWT payload (base64url → JSON)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));

            // Build user object with token — we have the user ID from JWT
            // Fetch full user profile from API to get name, email, avatar etc.
            fetch('/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch user profile');
                    return res.json();
                })
                .then((userData) => {
                    const credentials = {
                        _id: userData._id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        avatar: userData.avatar,
                        token,
                    };
                    dispatch(setCredentials(credentials));
                    navigate('/');
                })
                .catch(() => {
                    // Fallback: store token with minimal user info from JWT
                    const credentials = {
                        _id: payload.id,
                        token,
                    };
                    dispatch(setCredentials(credentials));
                    navigate('/');
                });
        } catch (err) {
            setError('Invalid authentication token');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [searchParams, dispatch, navigate]);

    if (error) {
        return (
            <div className="auth-page">
                <div className="auth-card card">
                    <div className="auth-header">
                        <h1>Authentication Failed</h1>
                        <p>{error}</p>
                        <p>Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return <Loader />;
};

export default AuthCallback;
