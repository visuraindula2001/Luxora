import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        api.dispatch(logout());
    }
    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Products', 'Product', 'Categories', 'Cart', 'Orders', 'Reviews', 'Wishlist', 'Coupons', 'Users', 'Stats'],
    endpoints: (builder) => ({
        // Products
        getProducts: builder.query({
            query: (params) => ({ url: '/products', params }),
            providesTags: ['Products'],
        }),
        searchProducts: builder.query({
            query: (q) => `/products/search?q=${q}`,
        }),
        getFeaturedProducts: builder.query({
            query: () => '/products/featured',
            providesTags: ['Products'],
        }),
        getProductBySlug: builder.query({
            query: (slug) => `/products/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
        }),

        // Categories
        getCategories: builder.query({
            query: () => '/categories',
            providesTags: ['Categories'],
        }),

        // Cart
        getCart: builder.query({
            query: () => '/cart',
            providesTags: ['Cart'],
        }),
        addToCart: builder.mutation({
            query: (body) => ({ url: '/cart', method: 'POST', body }),
            invalidatesTags: ['Cart'],
        }),
        updateCartItem: builder.mutation({
            query: ({ itemId, quantity }) => ({ url: `/cart/${itemId}`, method: 'PUT', body: { quantity } }),
            invalidatesTags: ['Cart'],
        }),
        removeCartItem: builder.mutation({
            query: (itemId) => ({ url: `/cart/${itemId}`, method: 'DELETE' }),
            invalidatesTags: ['Cart'],
        }),

        // Orders
        createOrder: builder.mutation({
            query: (body) => ({ url: '/orders', method: 'POST', body }),
            invalidatesTags: ['Cart', 'Orders'],
        }),
        getMyOrders: builder.query({
            query: () => '/orders',
            providesTags: ['Orders'],
        }),
        getOrderById: builder.query({
            query: (id) => `/orders/${id}`,
        }),

        // Reviews
        getProductReviews: builder.query({
            query: ({ productId, page = 1 }) => `/reviews/product/${productId}?page=${page}`,
            providesTags: ['Reviews'],
        }),
        createReview: builder.mutation({
            query: (body) => ({ url: '/reviews', method: 'POST', body }),
            invalidatesTags: ['Reviews', 'Product'],
        }),

        // Wishlist
        getWishlist: builder.query({
            query: () => '/wishlist',
            providesTags: ['Wishlist'],
        }),
        addToWishlist: builder.mutation({
            query: (productId) => ({ url: `/wishlist/${productId}`, method: 'POST' }),
            invalidatesTags: ['Wishlist'],
        }),
        removeFromWishlist: builder.mutation({
            query: (productId) => ({ url: `/wishlist/${productId}`, method: 'DELETE' }),
            invalidatesTags: ['Wishlist'],
        }),

        // Coupons
        validateCoupon: builder.mutation({
            query: (body) => ({ url: '/coupons/validate', method: 'POST', body }),
        }),

        // Admin
        getAdminStats: builder.query({
            query: () => '/admin/stats',
            providesTags: ['Stats'],
        }),
        getAdminOrders: builder.query({
            query: (params) => ({ url: '/orders/admin/all', params }),
            providesTags: ['Orders'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PUT', body }),
            invalidatesTags: ['Orders', 'Stats'],
        }),
        getAdminUsers: builder.query({
            query: (params) => ({ url: '/users', params }),
            providesTags: ['Users'],
        }),
        // Admin — Product Management
        getAdminProducts: builder.query({
            query: (params) => ({ url: '/products', params }),
            providesTags: ['Products'],
        }),
        createProduct: builder.mutation({
            query: (body) => ({ url: '/products', method: 'POST', body }),
            invalidatesTags: ['Products', 'Stats'],
        }),
        updateProduct: builder.mutation({
            // body can be a FormData (multipart) or plain object
            query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
            invalidatesTags: ['Products', 'Stats'],
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Products', 'Stats'],
        }),
    }),
});

export const {
    useGetProductsQuery, useSearchProductsQuery, useGetFeaturedProductsQuery,
    useGetProductBySlugQuery, useGetCategoriesQuery,
    useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation,
    useCreateOrderMutation, useGetMyOrdersQuery, useGetOrderByIdQuery,
    useGetProductReviewsQuery, useCreateReviewMutation,
    useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation,
    useValidateCouponMutation,
    useGetAdminStatsQuery, useGetAdminOrdersQuery, useUpdateOrderStatusMutation, useGetAdminUsersQuery,
    useGetAdminProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation,
} = apiSlice;
