import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    FiShoppingBag, FiUsers, FiDollarSign, FiPackage,
    FiBarChart2, FiPlus, FiEdit2, FiTrash2, FiX,
    FiHome, FiList, FiAlertCircle, FiSave, FiUpload,
    FiImage, FiCheckCircle,
} from 'react-icons/fi';
import {
    useGetAdminStatsQuery,
    useGetAdminOrdersQuery,
    useUpdateOrderStatusMutation,
    useGetAdminProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetCategoriesQuery,
} from '../../features/api/apiSlice';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './Dashboard.css';

// ─── Thumbnail Upload Zone ────────────────────────────────────────────────────
const ThumbnailUpload = ({ preview, onFileChange, onRemove }) => {
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileChange(file);
    };

    return (
        <div className="admin-upload-zone"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && inputRef.current.click()}
            style={{ borderColor: dragging ? 'var(--color-primary)' : undefined, cursor: preview ? 'default' : 'pointer' }}
        >
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) onFileChange(e.target.files[0]); e.target.value = ''; }}
            />
            {preview ? (
                <div className="admin-upload-preview">
                    <img src={preview} alt="Thumbnail preview" className="admin-upload-preview__img" />
                    <div className="admin-upload-preview__overlay">
                        <button type="button" className="admin-upload-preview__change"
                            onClick={e => { e.stopPropagation(); inputRef.current.click(); }}>
                            <FiUpload /> Change
                        </button>
                        <button type="button" className="admin-upload-preview__remove"
                            onClick={e => { e.stopPropagation(); onRemove(); }}>
                            <FiX /> Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div className="admin-upload-placeholder">
                    <FiUpload className="admin-upload-placeholder__icon" />
                    <p className="admin-upload-placeholder__text">Drop image here or <span>browse</span></p>
                    <p className="admin-upload-placeholder__hint">JPG, PNG, WebP · Max 5 MB</p>
                </div>
            )}
        </div>
    );
};

// ─── Gallery Upload Grid ──────────────────────────────────────────────────────
const GalleryUpload = ({ previews, onFilesAdd, onRemove }) => {
    const inputRef = useRef();
    const remaining = 5 - previews.length;

    return (
        <div className="admin-gallery">
            {previews.map((p, i) => (
                <div key={i} className="admin-gallery__item">
                    <img src={p.url} alt={`Gallery ${i + 1}`} />
                    <button type="button" className="admin-gallery__remove" onClick={() => onRemove(i)}>
                        <FiX />
                    </button>
                    {p.isExisting && <span className="admin-gallery__badge">Saved</span>}
                </div>
            ))}
            {remaining > 0 && (
                <button type="button" className="admin-gallery__add" onClick={() => inputRef.current.click()}>
                    <FiPlus />
                    <span>Add</span>
                    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
                        multiple style={{ display: 'none' }}
                        onChange={e => {
                            const files = Array.from(e.target.files).slice(0, remaining);
                            onFilesAdd(files);
                            e.target.value = '';
                        }}
                    />
                </button>
            )}
        </div>
    );
};

// ─── Product Form Modal ───────────────────────────────────────────────────────
const emptyForm = {
    name: '', price: '', compareAtPrice: '', brand: '',
    stock: '', category: '', description: '',
    tags: '', isFeatured: false, isActive: true,
};

const ProductModal = ({ product, categories, onClose, onSave }) => {
    const [form, setForm] = useState(
        product ? {
            name: product.name || '',
            price: product.price || '',
            compareAtPrice: product.compareAtPrice || '',
            brand: product.brand || '',
            stock: product.stock ?? '',
            category: product.category?._id || product.category || '',
            description: product.description || '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            isFeatured: product.isFeatured || false,
            isActive: product.isActive !== undefined ? product.isActive : true,
        } : emptyForm
    );

    // Thumbnail state
    const [thumbFile, setThumbFile] = useState(null);
    const [thumbPreview, setThumbPreview] = useState(product?.thumbnail || '');

    // Gallery state  {url, isExisting, file?}
    const [gallery, setGallery] = useState(
        (product?.images || []).map(img => ({ url: img.url, publicId: img.publicId, isExisting: true }))
    );
    const [galleryFiles, setGalleryFiles] = useState([]);

    const [loading, setLoading] = useState(false);

    const handle = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleThumbSelect = (file) => {
        setThumbFile(file);
        setThumbPreview(URL.createObjectURL(file));
    };

    const handleThumbRemove = () => {
        setThumbFile(null);
        setThumbPreview('');
    };

    const handleGalleryAdd = (files) => {
        const newPreviews = files.map(f => ({ url: URL.createObjectURL(f), isExisting: false }));
        setGallery(prev => [...prev, ...newPreviews].slice(0, 5));
        setGalleryFiles(prev => [...prev, ...files].slice(0, 5));
    };

    const handleGalleryRemove = (index) => {
        const item = gallery[index];
        // Count non-existing items before this index to find the file index
        if (!item.isExisting) {
            const fileIdx = gallery.slice(0, index).filter(g => !g.isExisting).length;
            setGalleryFiles(prev => prev.filter((_, i) => i !== fileIdx));
        }
        setGallery(prev => prev.filter((_, i) => i !== index));
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();

            // Text fields
            fd.append('name', form.name.trim());
            fd.append('description', form.description.trim());
            fd.append('price', form.price);
            fd.append('stock', form.stock);
            fd.append('category', form.category);
            if (form.compareAtPrice) fd.append('compareAtPrice', form.compareAtPrice);
            if (form.brand.trim()) fd.append('brand', form.brand.trim());
            fd.append('isFeatured', form.isFeatured ? 'true' : 'false');
            fd.append('isActive', form.isActive ? 'true' : 'false');
            const tagsArr = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            fd.append('tags', JSON.stringify(tagsArr));

            // Files
            if (thumbFile) fd.append('thumbnail', thumbFile);
            galleryFiles.forEach(f => fd.append('images', f));

            await onSave(fd);
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || err?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal__header">
                    <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
                    <button type="button" className="admin-modal__close" onClick={onClose}><FiX /></button>
                </div>

                <form className="admin-modal__body" onSubmit={submit}>
                    <div className="admin-form-grid">

                        {/* ── Images Section ─────────────────────────────── */}
                        <div className="admin-form-group admin-form-group--full">
                            <label><FiImage style={{ marginRight: 4 }} />Thumbnail *</label>
                            <ThumbnailUpload
                                preview={thumbPreview}
                                onFileChange={handleThumbSelect}
                                onRemove={handleThumbRemove}
                            />
                            {thumbFile && (
                                <p className="admin-file-name"><FiCheckCircle /> {thumbFile.name}</p>
                            )}
                        </div>

                        <div className="admin-form-group admin-form-group--full">
                            <label><FiImage style={{ marginRight: 4 }} />Gallery Images (up to 5)</label>
                            <GalleryUpload
                                previews={gallery}
                                onFilesAdd={handleGalleryAdd}
                                onRemove={handleGalleryRemove}
                            />
                        </div>

                        {/* ── Product Fields ─────────────────────────────── */}
                        <div className="admin-form-group admin-form-group--full">
                            <label>Product Name *</label>
                            <input name="name" value={form.name} onChange={handle} required
                                placeholder="e.g. Premium Wireless Headphones" />
                        </div>

                        <div className="admin-form-group">
                            <label>Price ($) *</label>
                            <input name="price" type="number" step="0.01" min="0" value={form.price}
                                onChange={handle} required placeholder="0.00" />
                        </div>
                        <div className="admin-form-group">
                            <label>Compare At Price ($)</label>
                            <input name="compareAtPrice" type="number" step="0.01" min="0"
                                value={form.compareAtPrice} onChange={handle} placeholder="0.00" />
                        </div>

                        <div className="admin-form-group">
                            <label>Brand</label>
                            <input name="brand" value={form.brand} onChange={handle} placeholder="Brand name" />
                        </div>
                        <div className="admin-form-group">
                            <label>Stock *</label>
                            <input name="stock" type="number" min="0" value={form.stock}
                                onChange={handle} required placeholder="0" />
                        </div>

                        <div className="admin-form-group">
                            <label>Category *</label>
                            <select name="category" value={form.category} onChange={handle} required>
                                <option value="">Select category…</option>
                                {categories?.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Tags (comma-separated)</label>
                            <input name="tags" value={form.tags} onChange={handle}
                                placeholder="wireless, audio, premium" />
                        </div>

                        <div className="admin-form-group admin-form-group--full">
                            <label>Description *</label>
                            <textarea name="description" value={form.description}
                                onChange={handle} rows={3} required
                                placeholder="Describe the product…" />
                        </div>

                        <div className="admin-form-checkboxes">
                            <label className="admin-checkbox">
                                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handle} />
                                <span>Featured Product</span>
                            </label>
                            <label className="admin-checkbox">
                                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handle} />
                                <span>Active (visible to customers)</span>
                            </label>
                        </div>
                    </div>

                    <div className="admin-modal__footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading
                                ? <><span className="admin-spinner" /> Uploading…</>
                                : <><FiSave style={{ marginRight: 6 }} />{product ? 'Save Changes' : 'Create Product'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirm = ({ product, onClose, onConfirm }) => (
    <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal admin-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
                <h3>Delete Product</h3>
                <button className="admin-modal__close" onClick={onClose}><FiX /></button>
            </div>
            <div className="admin-modal__body" style={{ padding: '24px 28px' }}>
                <div className="admin-delete-warning">
                    <FiAlertCircle className="admin-delete-warning__icon" />
                    <p>Are you sure you want to delete <strong>{product?.name}</strong>?
                        This cannot be undone and will remove images from Cloudinary.</p>
                </div>
            </div>
            <div className="admin-modal__footer">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
            </div>
        </div>
    </div>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ stats, ordersData, onStatusChange }) => {
    const orders = ordersData?.orders || ordersData || [];
    const statCards = [
        { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <FiDollarSign />, color: '#6c5ce7' },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <FiShoppingBag />, color: '#00d2ff' },
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: <FiUsers />, color: '#00e676' },
        { label: 'Total Products', value: stats?.totalProducts || 0, icon: <FiPackage />, color: '#ffc107' },
    ];
    return (
        <>
            <div className="admin-stats">
                {statCards.map((s, i) => (
                    <div key={i} className="admin-stat-card card">
                        <div className="admin-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                        <div>
                            <p className="admin-stat-label">{s.label}</p>
                            <p className="admin-stat-value">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="admin-section">
                <h2><FiBarChart2 />Recent Orders</h2>
                <div className="admin-table-container card">
                    {orders.length === 0 ? <div className="admin-empty">No orders yet.</div> : (
                        <table className="admin-table">
                            <thead><tr>
                                <th>Order ID</th><th>Customer</th><th>Items</th>
                                <th>Total</th><th>Status</th><th>Action</th>
                            </tr></thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td className="admin-table__id">#{order._id?.slice(-6).toUpperCase()}</td>
                                        <td>{order.user?.name || 'N/A'}</td>
                                        <td>{order.items?.length || 0}</td>
                                        <td>${order.totalPrice?.toFixed(2)}</td>
                                        <td><span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>{order.status}</span></td>
                                        <td>
                                            <select className="admin-status-select" value={order.status}
                                                onChange={e => onStatusChange(order._id, e.target.value)}>
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── Products Tab ─────────────────────────────────────────────────────────────
const ProductsTab = () => {
    const { data, isLoading } = useGetAdminProductsQuery({ limit: 100, page: 1 });
    const { data: categoriesData } = useGetCategoriesQuery();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();

    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');

    const products = (data?.products || []).filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(search.toLowerCase())
    );
    const categories = categoriesData || [];

    const handleCreate = async (formData) => {
        await createProduct(formData).unwrap();
        toast.success('Product created!');
    };

    const handleUpdate = async (formData) => {
        await updateProduct({ id: modal.edit._id, body: formData }).unwrap();
        toast.success('Product updated!');
    };

    const handleDelete = async () => {
        try {
            await deleteProduct(modal.delete._id).unwrap();
            toast.success('Product deleted');
            setModal(null);
        } catch (err) {
            toast.error(err?.data?.message || err?.message || 'Failed to delete product');
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="admin-section">
            <div className="admin-section__toolbar">
                <div>
                    <h2 style={{ marginBottom: 0 }}><FiPackage />Products</h2>
                    <p className="admin-section__sub">{products.length} product{products.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="admin-toolbar-right">
                    <input className="admin-search" placeholder="Search products…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => setModal('create')}>
                        <FiPlus style={{ marginRight: 6 }} />Add Product
                    </button>
                </div>
            </div>

            <div className="admin-table-container card">
                {products.length === 0 ? (
                    <div className="admin-empty">
                        No products found.{' '}
                        <button className="admin-empty__link" onClick={() => setModal('create')}>
                            Add the first one →
                        </button>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead><tr>
                            <th>Product</th><th>Category</th><th>Price</th>
                            <th>Stock</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id}>
                                    <td>
                                        <div className="admin-product-row">
                                            {p.thumbnail
                                                ? <img src={p.thumbnail} alt={p.name} className="admin-product-thumb" />
                                                : <div className="admin-product-thumb admin-product-thumb--placeholder"><FiImage /></div>
                                            }
                                            <div>
                                                <p className="admin-product-row__name">{p.name}</p>
                                                <p className="admin-product-row__brand">{p.brand || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.category?.name || '—'}</td>
                                    <td>
                                        <span className="admin-price">${p.price?.toFixed(2)}</span>
                                        {p.compareAtPrice > p.price && (
                                            <span className="admin-price--compare">${p.compareAtPrice?.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td><span className={p.stock <= 5 ? 'admin-stock admin-stock--low' : 'admin-stock'}>{p.stock}</span></td>
                                    <td>
                                        {p.isActive
                                            ? <span className="badge badge-success">Active</span>
                                            : <span className="badge badge-danger">Inactive</span>}
                                        {p.isFeatured && <span className="badge badge-warning" style={{ marginLeft: 4 }}>Featured</span>}
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            <button className="admin-action-btn admin-action-btn--edit"
                                                title="Edit" onClick={() => setModal({ edit: p })}>
                                                <FiEdit2 />
                                            </button>
                                            <button className="admin-action-btn admin-action-btn--delete"
                                                title="Delete" onClick={() => setModal({ delete: p })}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal === 'create' && (
                <ProductModal categories={categories} onClose={() => setModal(null)} onSave={handleCreate} />
            )}
            {modal?.edit && (
                <ProductModal product={modal.edit} categories={categories}
                    onClose={() => setModal(null)} onSave={handleUpdate} />
            )}
            {modal?.delete && (
                <DeleteConfirm product={modal.delete} onClose={() => setModal(null)} onConfirm={handleDelete} />
            )}
        </div>
    );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const OrdersTab = ({ ordersData, onStatusChange }) => {
    const orders = ordersData?.orders || ordersData || [];
    return (
        <div className="admin-section">
            <h2><FiShoppingBag />All Orders</h2>
            <div className="admin-table-container card">
                {orders.length === 0 ? <div className="admin-empty">No orders yet.</div> : (
                    <table className="admin-table">
                        <thead><tr>
                            <th>Order ID</th><th>Customer</th><th>Email</th>
                            <th>Items</th><th>Total</th><th>Paid</th><th>Status</th><th>Update</th>
                        </tr></thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td className="admin-table__id">#{order._id?.slice(-6).toUpperCase()}</td>
                                    <td>{order.user?.name || 'N/A'}</td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.user?.email || '-'}</td>
                                    <td>{order.items?.length || 0}</td>
                                    <td>${order.totalPrice?.toFixed(2)}</td>
                                    <td>{order.isPaid
                                        ? <span className="badge badge-success">Paid</span>
                                        : <span className="badge badge-danger">Unpaid</span>}
                                    </td>
                                    <td><span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>{order.status}</span></td>
                                    <td>
                                        <select className="admin-status-select" value={order.status}
                                            onChange={e => onStatusChange(order._id, e.target.value)}>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useSelector(s => s.auth);
    const [activeTab, setActiveTab] = useState('overview');

    const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery(
        undefined, { skip: !user || user.role !== 'admin' }
    );
    const { data: ordersData } = useGetAdminOrdersQuery(
        { limit: 50 }, { skip: !user || user.role !== 'admin' }
    );
    const [updateStatus] = useUpdateOrderStatusMutation();

    if (!user || user.role !== 'admin') return (
        <div className="section container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2>Admin access required</h2>
            <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Go Home</Link>
        </div>
    );

    if (statsLoading) return <Loader />;

    const handleStatusChange = async (id, status) => {
        try {
            await updateStatus({ id, status }).unwrap();
            toast.success('Status updated');
        } catch (err) { toast.error(err?.data?.message || 'Error'); }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <FiHome /> },
        { id: 'products', label: 'Products', icon: <FiPackage /> },
        { id: 'orders', label: 'Orders', icon: <FiList /> },
    ];

    return (
        <div className="admin-layout section">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__brand">
                    <span className="admin-sidebar__logo">⚡</span>
                    <div>
                        <p className="admin-sidebar__title">Admin Panel</p>
                        <p className="admin-sidebar__user">{user.name}</p>
                    </div>
                </div>
                <nav className="admin-nav">
                    {navItems.map(item => (
                        <button key={item.id}
                            className={`admin-nav__item ${activeTab === item.id ? 'admin-nav__item--active' : ''}`}
                            onClick={() => setActiveTab(item.id)}>
                            {item.icon}<span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar__footer">
                    <Link to="/" className="admin-nav__item">
                        <FiHome /><span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            <main className="admin-content">
                <div className="admin-content__header">
                    <div>
                        <h1 className="admin-content__title">
                            {navItems.find(n => n.id === activeTab)?.label}
                        </h1>
                        <p className="admin-content__subtitle">
                            {activeTab === 'overview' && 'Store at a glance'}
                            {activeTab === 'products' && 'Manage your product catalog'}
                            {activeTab === 'orders' && 'Track and update customer orders'}
                        </p>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <OverviewTab stats={stats} ordersData={ordersData} onStatusChange={handleStatusChange} />
                )}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'orders' && (
                    <OrdersTab ordersData={ordersData} onStatusChange={handleStatusChange} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
