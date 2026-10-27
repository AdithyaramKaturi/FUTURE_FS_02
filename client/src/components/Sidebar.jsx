import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Award,
  Settings,
  LogOut,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'info');
      navigate('/login');
    } catch (err) {
      addToast('Error during logout', 'error');
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/leads', label: 'All Leads', icon: Users },
    { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    { to: '/converted', label: 'Converted Clients', icon: Award },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="drawer-overlay"
          onClick={onCloseMobile}
          style={{ zIndex: 35 }}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="logo-badge" onClick={onCloseMobile}>
            <div className="logo-icon-box">
              <Zap size={22} />
            </div>
            <div>
              <div className="logo-title">LeadFlow</div>
              <div className="logo-subtitle">Mini CRM</div>
            </div>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={onCloseMobile}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ margin: '16px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ color: '#60a5fa' }}
          >
            <ExternalLink size={18} />
            <span>Public Site & Form</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-info">
              <div className="user-name" title={user?.name}>
                {user?.name || 'Administrator'}
              </div>
              <div className="user-role">{user?.role || 'Admin'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{
                color: '#94a3b8',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color var(--transition-fast)'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
