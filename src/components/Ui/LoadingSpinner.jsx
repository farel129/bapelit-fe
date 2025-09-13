import { Loader } from "lucide-react";

const LoadingSpinner = ({ size = 'default', text = 'Memuat...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader className={`animate-spin ${sizeClasses[size]} text-black`} />
      {text && <span className="text-[#6b7280]">{text}</span>}
    </div>
  );
};

export default LoadingSpinner