import { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { message, type } = toast;

  let Icon = Info;
  let color = 'var(--text-main)';
  let bgColor = 'var(--bg-surface)';
  let borderColor = 'var(--border-color)';

  if (type === 'success') {
    Icon = CheckCircle;
    color = 'var(--success)';
    borderColor = 'var(--success)';
  } else if (type === 'error') {
    Icon = XCircle;
    color = 'var(--error)';
    borderColor = 'var(--error)';
  } else if (type === 'warning') {
    Icon = AlertCircle;
    color = 'var(--warning)';
    borderColor = 'var(--warning)';
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: bgColor,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-hover)',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out forwards',
    }}>
      <Icon size={24} color={color} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500' }}>
        {message}
      </div>
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
      >
        <X size={16} />
      </button>
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
