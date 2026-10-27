import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Lock,
  Database,
  Shield,
  Save,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import Header from '../components/Header.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authService } from '../services/authService.js';
import { analyticsService } from '../services/analyticsService.js';

export const SettingsPage = () => {
  const { onOpenMobile } = useOutletContext();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Demo Reset Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast('Name and email cannot be empty', 'error');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authService.updateProfile({ name, email });
      if (res.success) {
        updateUser({ name, email });
        addToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Please enter both your current and new password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password confirmation does not match', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        addToast('Password changed successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Clear All Data
  const handleClearAllData = async () => {
    try {
      setResettingDemo(true);
      const res = await analyticsService.clearAllData();
      if (res.success) {
        addToast('All leads, notes, and follow-ups have been completely cleared.', 'success');
        setIsResetConfirmOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to clear data', 'error');
    } finally {
      setResettingDemo(false);
    }
  };

  return (
    <>
      <Header
        title="CRM Settings"
        subtitle="Manage administrator profile, security credentials, and system settings"
        onOpenMobile={onOpenMobile}
      />

      <div className="page-content" style={{ maxWidth: '980px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Administrator Profile */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Admin Profile</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Update your display name and login email address
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProfile}
                >
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security & Credentials</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Update password for this administrator account
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingPassword}
                >
                  <Lock size={16} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Pipeline Data Management */}
          <div className="card" style={{ borderColor: '#fecaca', backgroundColor: '#fffbfb' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Pipeline Data Management
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '520px', marginTop: '2px' }}>
                    Wipe all current leads, notes, and scheduled follow-ups to start with a completely fresh, empty pipeline.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setIsResetConfirmOpen(true)}
              >
                <Trash2 size={15} />
                <span>Clear All Leads</span>
              </button>
            </div>
          </div>

          {/* Section 4: System Diagnostics */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#64748b" />
              <span>System & Environment Diagnostics</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  API Server Status
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 600, color: '#059669', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Online (REST Engine)</span>
                </div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Database Engine
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                  <Database size={16} color="#3b82f6" />
                  <span>MongoDB with Mongoose ODM</span>
                </div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Authentication Mode
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                  <Shield size={16} color="#7c3aed" />
                  <span>JWT in HTTP-only Cookie</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Leads Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleClearAllData}
        title="Clear All Leads?"
        message="This will permanently delete all leads, notes, and scheduled follow-ups. You will start with a completely fresh, empty pipeline. Are you sure?"
        confirmText="Clear All Data"
        isDestructive={true}
        isLoading={resettingDemo}
      />
    </>
  );
};

export default SettingsPage;
