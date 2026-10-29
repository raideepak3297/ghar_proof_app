import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Building2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AppLogo } from './AppLogo';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast('Signed out successfully', 'info');
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Properties', path: '/rentals' },
    { label: 'Disputes', path: '/disputes' },
  ];

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.email || 'User'
    : 'User';

  const isLandlord = role === 'landlord';

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
    }}>
      <div style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Brand App Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <AppLogo size={32} showText={true} />
        </Link>

        {/* Center Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#4f46e5' : '#475569',
                  background: isActive ? '#eef2ff' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 120ms ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Vibrant Role Chip & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Unmistakable Vibrant Role Chip (Vibrant Indigo for Landlord, Vibrant Emerald for Tenant) */}
          {isLandlord ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.28rem 0.75rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Building2 size={13} color="#ffffff" />
              <span>Landlord</span>
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.28rem 0.75rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <User size={13} color="#ffffff" />
              <span>Tenant</span>
            </span>
          )}

          <span style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
            {displayName}
          </span>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            title="Sign out"
            style={{ padding: '0.35rem', color: '#64748b' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
