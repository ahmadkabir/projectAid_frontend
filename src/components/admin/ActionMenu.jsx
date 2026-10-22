import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Trash2, Paperclip } from 'lucide-react';

const ActionMenu = ({ project, onEdit, onDeleteClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the menu container
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Use a small delay to prevent immediate closure when opening
    if (isOpen) {
      // Use setTimeout to ensure the menu is rendered before attaching listener
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleView = () => {
    setIsOpen(false);
    navigate(`/admin/projects/${project.id}/view`);
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit(project);
  };

  const handleDelete = () => {
    setIsOpen(false);
    // Call the parent's onDeleteClick handler to show the modal
    if (onDeleteClick) {
      onDeleteClick(project);
    }
  };

  const handleAttachment = () => {
    setIsOpen(false);
    navigate(`/admin/projects/${project.id}/attachments`);
  };

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-admin-bg transition-colors"
        aria-label="Actions"
        aria-expanded={isOpen}
        type="button"
      >
        <MoreVertical size={18} className="text-admin-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-admin-border z-[100] py-1">
          <button
            onClick={handleView}
            className="w-full px-4 py-2 text-left text-sm text-admin-text hover:bg-admin-bg flex items-center space-x-2 transition-colors"
          >
            <Eye size={16} />
            <span>View</span>
          </button>
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-admin-text hover:bg-admin-bg flex items-center space-x-2 transition-colors"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleAttachment}
            className="w-full px-4 py-2 text-left text-sm text-admin-text hover:bg-admin-bg flex items-center space-x-2 transition-colors"
          >
            <Paperclip size={16} />
            <span>Attachment</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-admin-pending hover:bg-admin-pending/10 flex items-center space-x-2 transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
