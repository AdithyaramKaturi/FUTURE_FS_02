import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || 'new').toLowerCase();

  return (
    <span className={`badge badge-${normalizedStatus}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {normalizedStatus}
    </span>
  );
};

export default StatusBadge;
