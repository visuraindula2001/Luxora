import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        isCartOpen: false,
    },
    reducers: {
        toggleCart: (state) => { state.isCartOpen = !state.isCartOpen; },
        openCart: (state) => { state.isCartOpen = true; },
        closeCart: (state) => { state.isCartOpen = false; },
    },
});

export const { toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
