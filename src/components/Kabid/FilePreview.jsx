import { FileText, X } from "lucide-react";

const FilePreview = ({ file, onRemove, index }) => {
  const isImage = file.type?.startsWith('image/');
  const fileSize = Math.round(file.size / 1024);

  return (
    <div className="border rounded-lg p-3 bg-gray-50 relative">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isImage ? (
            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {fileSize} KB
          </p>
        </div>
        
        <button
          onClick={() => onRemove(index)}
          className="flex-shrink-0 p-1 text-red-600 hover:bg-red-100 rounded"
          title="Hapus file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default FilePreview