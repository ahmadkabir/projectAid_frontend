import { useState, useRef } from 'react';
import { Upload, File, X, Image as ImageIcon, CheckCircle } from 'lucide-react';

const FileUpload = ({
  label,
  accept,
  value,
  onChange,
  required = false,
  error,
  previewType = 'file', // 'file' or 'image'
  recommendedSize,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = acceptedTypes.some(type => 
      type.startsWith('.') ? type === fileExtension : file.type.match(type)
    );

    if (!isValidType) {
      alert(`Invalid file type. Accepted types: ${accept}`);
      return;
    }

    // Handle file preview
    if (previewType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasFile = value !== null && value !== undefined;

  return (
    <div className={className}>
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {recommendedSize && (
          <span className="text-xs text-gray-500 font-normal ml-2">
            Recommended: {recommendedSize}
          </span>
        )}
      </label>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary-blue bg-primary-blue/5 scale-[1.02]' 
            : hasFile 
              ? 'border-primary-green bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-primary-blue hover:bg-primary-blue/5'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          className="hidden"
          required={required && !hasFile}
        />

        {hasFile ? (
          // File Selected State
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {previewType === 'image' && preview ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                  {previewType === 'image' ? (
                    <ImageIcon className="text-primary-blue" size={24} />
                  ) : (
                    <File className="text-primary-blue" size={24} />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {value.name}
                  </p>
                  <CheckCircle className="text-primary-green flex-shrink-0" size={16} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(value.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          // Empty State
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-primary-blue/10' : 'bg-gray-100'
              }`}>
                {previewType === 'image' ? (
                  <ImageIcon className={`${isDragging ? 'text-primary-blue' : 'text-gray-400'}`} size={32} />
                ) : (
                  <Upload className={`${isDragging ? 'text-primary-blue' : 'text-gray-400'}`} size={32} />
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragging ? 'Drop file here' : 'Drag & drop file here'}
            </p>
            <p className="text-xs text-gray-500">
              or <span className="text-primary-blue font-medium">click to browse</span>
            </p>
            {accept && (
              <p className="text-xs text-gray-400 mt-2">
                Accepted: {accept}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
