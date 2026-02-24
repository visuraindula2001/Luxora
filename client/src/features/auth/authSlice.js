import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Load user from localStorage
const userFromStorage = localStorage.getItem('luxora_user')
    ? JSON.parse(localStorage.getItem('luxora_user'))
    : null;
const tokenFromStorage = localStorage.getItem('luxora_token') || null;

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/auth/login', credentials);
        localStorage.setItem('luxora_user', JSON.stringify(data));
        localStorage.setItem('luxora_token', data.token);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/auth/register', userData);
        localStorage.setItem('luxora_user', JSON.stringify(data));
        localStorage.setItem('luxora_token', data.token);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: userFromStorage,
        token: tokenFromStorage,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('luxora_user');
            localStorage.removeItem('luxora_token');
        },
        setCredentials: (state, action) => {
            state.user = action.payload;
            state.token = action.payload.token;
            localStorage.setItem('luxora_user', JSON.stringify(action.payload));
            localStorage.setItem('luxora_token', action.payload.token);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.token = action.payload.token; })
            .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.token = action.payload.token; })
            .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
