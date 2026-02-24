import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function App() {
    return (
        <div className="app">
            <Header />
            <main style={{ minHeight: 'calc(100vh - var(--header-height) - 200px)', paddingTop: 'var(--header-height)' }}>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/orders" element={<OrderHistory />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/admin/*" element={<AdminDashboard />} />
                    </Routes>
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}

export default App;
