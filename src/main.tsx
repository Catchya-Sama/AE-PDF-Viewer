import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Error fallback: if React fails to render, show a visible error message
function showError(message: string) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding:16px;font-family:sans-serif;color:#f44336;background:#1e1e1e;height:100vh;box-sizing:border-box;">
        <h2 style="margin:0 0 8px 0;">React Render Error</h2>
        <pre style="white-space:pre-wrap;font-size:11px;">${message}</pre>
      </div>
    `;
  }
}

try {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    showError('Root element #root not found in DOM');
  }
} catch (e) {
  showError(String(e));
  throw e;
}