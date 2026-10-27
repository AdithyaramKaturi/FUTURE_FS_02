import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Showing <strong style={{ color: 'var(--color-navy)' }}>{startItem}</strong> to{' '}
        <strong style={{ color: 'var(--color-navy)' }}>{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--color-navy)' }}>{total}</strong> leads
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{ padding: '6px 10px' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', padding: '0 8px' }}>
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{ padding: '6px 10px' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
