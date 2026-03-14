import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Get the root DOM element where the React app will be mounted
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found. Check index.html for <div id="root">');

createRoot(rootEl).render(
    <StrictMode>
        <App />
    </StrictMode>
);
