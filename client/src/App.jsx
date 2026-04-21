import { Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

function App() {
    return (
        <div className="app">
            <Routes>
                {/* Admin Routes - Using separate layout */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Suspense fallback={<Loader />}><AdminDashboard /></Suspense>} />
                    <Route path="users" element={<Suspense fallback={<Loader />}><UserManagement /></Suspense>} />
                </Route>

                {/* Public routes with Header/Footer */}
                <Route
                    element={
                        <>
                            <Header />
                            <main style={{ minHeight: 'calc(100vh - var(--header-height) - 200px)', paddingTop: 'var(--header-height)' }}>
                                <Suspense fallback={<Loader />}>
                                    <Outlet />
                                </Suspense>
                            </main>
                            <Footer />
                        </>
                    }
                >
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrderHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
