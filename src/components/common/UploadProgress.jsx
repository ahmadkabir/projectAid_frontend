const UploadProgress = ({ label, percent = 0, className = '' }) => {
  const value = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-admin-text">{label || 'Uploading…'}</span>
        <span className="text-admin-muted tabular-nums">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-admin-border">
        <div
          className="h-full rounded-full bg-admin-blue-hover transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
