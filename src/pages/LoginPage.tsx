import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast('Please enter both email and password', 'error');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
      toast('Signed in successfully', 'success');
      navigate('/', { replace: true });
    } catch (err: any) {
      let msg = 'Invalid email or password.';
      if (err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(', ')
          : err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Unable to connect to server.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      background: 'radial-gradient(circle at 50% 20%, #eef2ff 0%, #f8fafc 65%, #f1f5f9 100%)',
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.25rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
      }}>
        {/* App Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <AppLogo size={52} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Sign in to <span style={{ color: '#4f46e5' }}>GharProof</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
            Tamper-proof rental condition & deposit protection
          </p>
        </div>

        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.7rem 0.9rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoComplete="email"
              required
              style={{
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoComplete="current-password"
              required
              style={{
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                padding: '0.65rem 0.85rem',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.7rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              transition: 'all 150ms ease',
            }}
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.84rem' }}>
          <span style={{ color: '#64748b' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 600, color: '#4f46e5' }}>Create account</Link>
        </div>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.74rem',
          color: '#94a3b8',
        }}>
          <Lock size={12} />
          <span>SHA-256 Tamper-Proof Cryptographic Security</span>
        </div>
      </div>
    </div>
  );
};
