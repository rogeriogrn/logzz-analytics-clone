import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-5 fade-in duration-300 ${type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-red-50 border-red-100 text-red-800'
            }`}>
            {type === 'success' ? (
                <CheckCircle size={20} className="text-emerald-500" />
            ) : (
                <XCircle size={20} className="text-red-500" />
            )}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className={`ml-2 p-1 rounded-full hover:bg-black/5 transition-colors ${type === 'success' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
