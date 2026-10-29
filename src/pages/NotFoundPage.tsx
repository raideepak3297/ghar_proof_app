import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.25rem',
    }}>
      <div style={{
        padding: '1rem',
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--color-danger-border)',
      }}>
        <ShieldAlert size={48} color="var(--color-danger)" />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ maxWidth: '420px', color: 'var(--text-secondary)' }}>
        The inspection, rental document, or page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        <Home size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
