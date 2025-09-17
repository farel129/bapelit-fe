import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React from 'react'

const Modal = ({ isOpen, onClose, title, children, type = 'info', maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;
    const typeClasses = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600'
    };
    const icons = {
        success: CheckCircle,
        error: AlertTriangle,
        warning: AlertTriangle,
        info: Info
    };
    const Icon = icons[type];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-hidden`}>
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <Icon className={`w-6 h-6 ${typeClasses[type]}`} />
                        <h3 className="text-lg font-semibold text-[#000000]">{title}</h3>
                    </div>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal