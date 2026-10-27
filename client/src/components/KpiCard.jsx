import React from 'react';

export const KpiCard = ({ title, value, caption, icon: Icon, color = '#2563eb', bg = '#eff6ff' }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-info">
        <span className="kpi-title">{title}</span>
        <span className="kpi-value">{value}</span>
        {caption && <span className="kpi-caption">{caption}</span>}
      </div>
      <div className="kpi-icon-box" style={{ backgroundColor: bg, color: color }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default KpiCard;
