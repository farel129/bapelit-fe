const Modal = ({ isOpen, onClose, children, title, type = 'default' }) => {
    if (!isOpen) return null;
    const modalTypes = {
        success: 'border-green-500 bg-green-50',
        error: 'border-red-500 bg-red-50',
        warning: 'border-yellow-500 bg-yellow-50',
        default: 'border-gray-200 bg-white'
    };
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl ${modalTypes[type]} border-2 transform transition-all duration-300 scale-100`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {type === 'success' && <CheckCircle className="text-green-600" size={24} />}
                        {type === 'error' && <AlertCircle className="text-red-600" size={24} />}
                        {type === 'warning' && <AlertCircle className="text-yellow-600" size={24} />}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Modal