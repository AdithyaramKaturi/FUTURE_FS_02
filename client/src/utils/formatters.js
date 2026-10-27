/**
 * Format ISO date string into readable Date (e.g., Oct 24, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format ISO date string into Date and Time (e.g., Oct 24, 2026, 2:30 PM)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

/**
 * Format numbers into currency format (e.g., $12,500)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Return friendly labels for lead acquisition channels
 */
export const getSourceLabel = (source) => {
  const map = {
    website: 'Website Form',
    referral: 'Referral',
    linkedin: 'LinkedIn',
    google: 'Google Search',
    'cold-outreach': 'Cold Outreach',
    other: 'Other'
  };
  return map[source] || source;
};
