import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      style={{ zIndex: 9999 }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastComponentProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onDismiss }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-900/95',
          border: 'border-emerald-500/50',
          icon: CheckCircle,
          iconColor: 'text-emerald-400',
          titleColor: 'text-emerald-100',
          messageColor: 'text-emerald-200',
        };
      case 'error':
        return {
          bg: 'bg-red-900/95',
          border: 'border-red-500/50',
          icon: XCircle,
          iconColor: 'text-red-400',
          titleColor: 'text-red-100',
          messageColor: 'text-red-200',
        };
      case 'warning':
        return {
          bg: 'bg-amber-900/95',
          border: 'border-amber-500/50',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          titleColor: 'text-amber-100',
          messageColor: 'text-amber-200',
        };
      case 'info':
        return {
          bg: 'bg-blue-900/95',
          border: 'border-blue-500/50',
          icon: Info,
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-100',
          messageColor: 'text-blue-200',
        };
    }
  };

  const styles = getToastStyles(toast.type);
  const Icon = styles.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }}
      className={`
        ${styles.bg} ${styles.border} backdrop-blur-xl border rounded-xl p-4 shadow-2xl
        min-w-0 w-full overflow-hidden relative
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={`${styles.titleColor} font-semibold text-sm mb-1`}>
              {toast.title}
            </h4>
          )}
          <p className={`${styles.messageColor} text-sm leading-relaxed`}>
            {toast.message}
          </p>
          
          {/* Action button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`
                ${styles.titleColor} mt-2 text-sm font-medium hover:underline
                focus:outline-none focus:underline transition-all duration-200
              `}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-white/60 hover:text-white/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-1"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-b-xl"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

// Helper functions for quick toast creation
export const createToast = {
  success: (message: string, title?: string, options?: Partial<Toast>) => ({
    type: 'success' as const,
    message,
    title,
    ...options,
  }),
  error: (message: string, title?: string, options?: Partial<Toast>) => ({
    type: 'error' as const,
    message,
    title,
    ...options,
  }),
  warning: (message: string, title?: string, options?: Partial<Toast>) => ({
    type: 'warning' as const,
    message,
    title,
    ...options,
  }),
  info: (message: string, title?: string, options?: Partial<Toast>) => ({
    type: 'info' as const,
    message,
    title,
    ...options,
  }),
}; 