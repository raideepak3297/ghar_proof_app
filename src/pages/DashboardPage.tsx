import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalsApi } from '../api/rentals.api';
import type { Rental } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Building2,
  Scale,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';

export const DashboardPage: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, role } = useAuth();
  const isLandlord = role === 'landlord';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await rentalsApi.getAll();
      setRentals(res.list || []);
    } catch {
      setRentals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || 'User'
    : 'User';

  const totalProperties = rentals.length;
  const activeLeases = rentals.filter((r) => r.status === 'active').length;
  const totalDeposit = rentals.reduce((acc, r) => acc + (r.depositAmount || 0), 0);
  const pendingActions = rentals.filter((r) => r.status !== 'active');

  const formatCurrencyINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Unique Vibrant Hero Banner (Vibrant Royal Indigo / Emerald) */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '2rem 2.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.28)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background watermark */}
        <div style={{
          position: 'absolute',
          right: '-25px',
          bottom: '-35px',
          opacity: 0.08,
          pointerEvents: 'none',
        }}>
          <AppLogo size={220} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.15)',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#34d399',
            marginBottom: '0.85rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
          }}>
            <ShieldCheck size={14} color="#34d399" />
            <span>Cryptographic Deposit Protection</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Welcome, {displayName}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#c7d2fe', maxWidth: '540px', lineHeight: 1.5 }}>
            {isLandlord
              ? 'Your rental properties and deposits are protected with SHA-256 baseline protocols.'
              : 'Review your locked room condition baselines and deposit refund settlements.'}
          </p>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '1.25rem 1.75rem',
          textAlign: 'right',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.05em' }}>
            Protected Deposits
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            {formatCurrencyINR(totalDeposit)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c7d2fe', marginTop: '0.2rem' }}>
            Across {activeLeases} active tenanc{activeLeases === 1 ? 'y' : 'ies'}
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="stat-strip" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-item">
          <div className="stat-label">Properties</div>
          <div className="stat-value">{totalProperties}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Active Leases</div>
          <div className="stat-value" style={{ color: '#059669' }}>{activeLeases}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Total Deposits</div>
          <div className="stat-value" style={{ color: '#4f46e5' }}>{formatCurrencyINR(totalDeposit)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Pending Reviews</div>
          <div className="stat-value" style={{ color: pendingActions.length > 0 ? '#d97706' : '#64748b' }}>
            {pendingActions.length}
          </div>
        </div>
      </div>

      {/* Action Required Hub */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Action Required & Verification Status</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {pendingActions.length} item{pendingActions.length === 1 ? '' : 's'} awaiting action
          </span>
        </div>

        {pendingActions.length === 0 ? (
          <div className="card" style={{
            padding: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.15)',
            }}>
              <CheckCircle2 size={22} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#065f46' }}>
                All Inspection Records Up-to-Date
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '0.15rem' }}>
                All rental properties have completed their required verification milestones with cryptographic integrity.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingActions.map((rental) => (
              <div
                key={rental._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Clock size={18} color="#d97706" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a' }}>
                      {rental.propertyAddress.line1}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {rental.status === 'invited'
                        ? isLandlord
                          ? `${rental.propertyAddress.city} • Waiting for tenant to accept rental invitation`
                          : `${rental.propertyAddress.city} • Action Required: Rental agreement invitation received`
                        : `${rental.propertyAddress.city} • Move-In Baseline awaiting review & dual sign-off`}
                    </div>
                  </div>
                </div>

                <Link to={`/rentals/${rental._id}`} className="btn btn-primary btn-sm">
                  <span>
                    {rental.status === 'invited'
                      ? isLandlord
                        ? 'View Property'
                        : 'Review & Accept'
                      : 'Review & Sign'}
                  </span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fast Navigation Modules */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.85rem' }}>Workspaces</h2>

        <div className="grid-2" style={{ gap: '1rem' }}>
          <Link
            to="/rentals"
            className="card"
            style={{
              textDecoration: 'none',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 120ms ease',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                background: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                border: '1px solid #c7d2fe',
              }}>
                <Building2 size={20} color="#4f46e5" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  Properties Workspace
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Manage lease agreements, tenant invitations, and property registries
                </div>
              </div>
            </div>
            <ArrowRight size={15} color="#4f46e5" />
          </Link>

          <Link
            to="/disputes"
            className="card"
            style={{
              textDecoration: 'none',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 120ms ease',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                border: '1px solid #fde68a',
              }}>
                <Scale size={20} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  Disputes & Settlements
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Itemized deduction claims, counter-offers, and net deposit refunds
                </div>
              </div>
            </div>
            <ArrowRight size={15} color="#d97706" />
          </Link>
        </div>
      </div>
    </div>
  );
};
