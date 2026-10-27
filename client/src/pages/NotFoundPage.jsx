import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        backgroundColor: '#f8fafc'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <AlertCircle size={36} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', marginBottom: '28px' }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/dashboard" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
        <Link to="/" className="btn btn-secondary">
          Public Website
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
