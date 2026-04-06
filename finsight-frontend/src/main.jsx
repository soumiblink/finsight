import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '500',
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
      }}
    />
  </React.StrictMode>
)
