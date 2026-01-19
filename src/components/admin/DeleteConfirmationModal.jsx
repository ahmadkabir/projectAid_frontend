import { useEffect, useRef } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, project, isDeleting = false }) => {
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the cancel button when modal opens
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  // Truncate description to 3-4 lines
  const truncateDescription = (text, maxLines = 4) => {
    if (!text) return 'No description available';
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(project.id);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 delete-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all delete-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2
              id="delete-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              Delete Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6" id="delete-modal-description">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>

          {/* Project Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="space-y-3">
              {/* Project Title */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Project Title
                </label>
                <p className="text-gray-900 font-medium mt-1">{project.title}</p>
              </div>

              {/* Project ID */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Project ID
                </label>
                <p className="text-gray-700 mt-1 font-mono text-sm">#{project.id}</p>
              </div>

              {/* Project Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-gray-700 mt-1 text-sm whitespace-pre-line line-clamp-4">
                  {truncateDescription(project.description, 4)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This project may have associated orders or support requests. 
              If so, deletion will be prevented.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={18} />
                <span>Delete Project</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
