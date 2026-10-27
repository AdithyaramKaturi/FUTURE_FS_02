import React from 'react';
import { Menu, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Header = ({ onOpenMobile, title, subtitle, onActionClick, actionLabel, actionIcon: ActionIcon = Plus }) => {
  const { user } = useAuth();

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="header-title-box">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        {actionLabel && onActionClick && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onActionClick}
          >
            <ActionIcon size={16} />
            <span>{actionLabel}</span>
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#f1f5f9',
            borderRadius: 'var(--border-radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-navy)'
          }}
        >
          <User size={15} color="#64748b" />
          <span>{user?.name?.split(' ')[0] || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
