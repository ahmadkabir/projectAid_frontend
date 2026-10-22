const STATUS_STYLES = {
  // Orders (backend enum)
  pending: { dot: 'bg-admin-pending', text: 'text-admin-pending', bg: 'bg-admin-pending/10', label: 'Pending' },
  completed: { dot: 'bg-admin-success', text: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Completed' },
  failed: { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20', label: 'Failed' },
  // Projects (lifecycle)
  draft: { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20', label: 'Draft' },
  pending_review: { dot: 'bg-admin-pending', text: 'text-admin-pending', bg: 'bg-admin-pending/10', label: 'Pending Review' },
  published: { dot: 'bg-admin-success', text: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Published' },
  archived: { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20', label: 'Archived' },
  // Legacy project statuses
  active: { dot: 'bg-admin-success', text: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Published' },
  inactive: { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20', label: 'Archived' },
  // Support requests
  open: { dot: 'bg-admin-blue', text: 'text-admin-blue', bg: 'bg-admin-blue/10', label: 'Open' },
  in_progress: { dot: 'bg-admin-pending', text: 'text-admin-pending', bg: 'bg-admin-pending/10', label: 'In Progress' },
  resolved: { dot: 'bg-admin-success', text: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Resolved' },
  closed: { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20', label: 'Closed' },
  // Roles
  admin: { dot: 'bg-admin-blue', text: 'text-admin-blue', bg: 'bg-admin-blue/10', label: 'Admin' },
  student: { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20', label: 'Student' }
};

const FALLBACK = { dot: 'bg-admin-neutral', text: 'text-admin-text/70', bg: 'bg-admin-neutral/20' };

// Compact dot + label pill. Never relies on color alone: the status text is
// always rendered alongside the colored dot.
const StatusBadge = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status] || { ...FALLBACK, label: status || 'Unknown' };

  return (
    <span className={`status-pill ${style.bg} ${style.text} ${className}`}>
      <span className={`status-dot ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
