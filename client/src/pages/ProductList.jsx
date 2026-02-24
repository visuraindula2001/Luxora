import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { useGetProductsQuery, useGetCategoriesQuery } from '../features/api/apiSlice';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/common/Loader';
import './ProductList.css';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const params = {
        page: searchParams.get('page') || 1,
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || '-createdAt',
        search: searchParams.get('search') || '',
        'price[gte]': searchParams.get('minPrice') || '',
        'price[lte]': searchParams.get('maxPrice') || '',
        featured: searchParams.get('featured') || '',
    };

    const { data, isLoading } = useGetProductsQuery(params);
    const { data: categories = [] } = useGetCategoriesQuery();

    const products = data?.products || [];
    const pagination = data?.pagination || {};

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) { newParams.set(key, value); } else { newParams.delete(key); }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const clearFilters = () => setSearchParams({});

    const sortOptions = [
        { label: 'Newest', value: '-createdAt' },
        { label: 'Price: Low to High', value: 'price' },
        { label: 'Price: High to Low', value: '-price' },
        { label: 'Top Rated', value: '-rating' },
        { label: 'Name A-Z', value: 'name' },
    ];

    if (isLoading) return <Loader />;

    return (
        <div className="product-list-page section">
            <div className="container">
                {/* Page Header */}
                <div className="plp-header">
                    <div>
                        <h1 className="plp-title">
                            {searchParams.get('search') ? `Results for "${searchParams.get('search')}"` : 'All Products'}
                        </h1>
                        <p className="plp-count">{pagination.total || products.length} products found</p>
                    </div>
                    <div className="plp-controls">
                        <div className="plp-sort">
                            <label>Sort by:</label>
                            <select className="input" value={params.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-secondary plp-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                            <FiFilter /> Filters
                        </button>
                    </div>
                </div>

                <div className="plp-layout">
                    {/* Filters Sidebar */}
                    <aside className={`plp-filters ${showFilters ? 'plp-filters--open' : ''}`}>
                        <div className="plp-filters__header">
                            <h3>Filters</h3>
                            <button onClick={clearFilters} className="plp-filters__clear">Clear All</button>
                            <button className="plp-filters__close" onClick={() => setShowFilters(false)}><FiX /></button>
                        </div>

                        {/* Category Filter */}
                        <div className="plp-filter-group">
                            <h4>Category <FiChevronDown /></h4>
                            <div className="plp-filter-options">
                                <label className="plp-filter-option">
                                    <input type="radio" name="category" checked={!params.category} onChange={() => updateFilter('category', '')} />
                                    <span>All Categories</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat._id} className="plp-filter-option">
                                        <input type="radio" name="category" checked={params.category === cat._id}
                                            onChange={() => updateFilter('category', cat._id)} />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="plp-filter-group">
                            <h4>Price Range</h4>
                            <div className="plp-price-inputs">
                                <input type="number" className="input" placeholder="Min" value={searchParams.get('minPrice') || ''}
                                    onChange={(e) => updateFilter('minPrice', e.target.value)} />
                                <span>—</span>
                                <input type="number" className="input" placeholder="Max" value={searchParams.get('maxPrice') || ''}
                                    onChange={(e) => updateFilter('maxPrice', e.target.value)} />
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="plp-products">
                        {products.length === 0 ? (
                            <div className="plp-empty">
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search terms</p>
                                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                <div className="product-grid">
                                    {products.map(p => <ProductCard key={p._id} product={p} />)}
                                </div>
                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="plp-pagination">
                                        {Array.from({ length: pagination.pages }, (_, i) => (
                                            <button key={i + 1} className={`plp-page-btn ${Number(params.page) === i + 1 ? 'plp-page-btn--active' : ''}`}
                                                onClick={() => updateFilter('page', String(i + 1))}>
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
