import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{
        position: 'fixed', top: '24px', right: '24px',
        zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#e74c3c' : t.type === 'info' ? '#2980b9' : '#1abc9c',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            fontSize: '14px',
            fontWeight: 500,
            minWidth: '260px',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideInToast 0.3s ease',
          }}>
            <span style={{ fontSize: '18px' }}>
              {t.type === 'error' ? '❌' : t.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
