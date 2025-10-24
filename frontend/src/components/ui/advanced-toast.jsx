import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 4000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options) => addToast({ ...options, message, type: 'success' }),
    error: (message, options) => addToast({ ...options, message, type: 'error' }),
    warning: (message, options) => addToast({ ...options, message, type: 'warning' }),
    info: (message, options) => addToast({ ...options, message, type: 'info' }),
    loading: (message, options) => addToast({ ...options, message, type: 'loading', duration: 0 }),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast Component
const ToastItem = ({ toast, onRemove }) => {
  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return (
          <motion.div
            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'loading':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        min-w-80 max-w-md p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getToastColors()}
        pointer-events-auto relative overflow-hidden
      `}
    >
      {/* Progress bar for timed toasts */}
      {toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getToastIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${toast.title ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {toast.message}
          </p>
          {toast.description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {toast.description}
            </p>
          )}
        </div>
        
        {toast.type !== 'loading' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ToastProvider;