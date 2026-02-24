import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1a1a2e',
                            color: '#f0f0f5',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                        },
                    }}
                />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
