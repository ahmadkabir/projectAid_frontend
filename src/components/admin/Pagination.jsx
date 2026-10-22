import { ChevronLeft, ChevronRight } from 'lucide-react';

// Builds the visible page-number window: first, last, and pages around the
// current one, with ellipses for the gaps.
const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push('ellipsis-start');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push('ellipsis-end');

  items.push(totalPages);
  return items;
};

const Pagination = ({ page, totalPages, total, limit, onPageChange, label = 'results' }) => {
  if (total <= 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const items = getPageItems(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-admin-border">
      <p className="text-sm text-admin-muted">
        Showing <span className="font-semibold text-admin-text">{start}-{end}</span> of{' '}
        <span className="font-semibold text-admin-text">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="admin-page-btn"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="hidden sm:flex items-center gap-1.5">
          {items.map((item, index) =>
            typeof item === 'string' ? (
              <span key={item} className="px-1 text-sm text-admin-muted">
                …
              </span>
            ) : (
              <button
                key={`page-${item}`}
                type="button"
                className={`admin-page-btn ${item === page ? 'admin-page-btn-active' : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}
        </div>

        <span className="sm:hidden px-2 text-sm text-admin-muted">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          className="admin-page-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
