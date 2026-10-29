import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalsApi } from '../api/rentals.api';
import { inspectionsApi } from '../api/inspections.api';
import type { Rental } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Building2,
  Scale,
  Clock,
  ArrowRight,
  CheckCircle2,
  Home,
} from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';

interface PendingAction {
  id: string;
  rentalId: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
}

export const DashboardPage: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, role } = useAuth();
  const isLandlord = role === 'landlord';

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await rentalsApi.getAll();
      const list = res.list || [];
      setRentals(list);

      const actions: PendingAction[] = [];

      for (const r of list) {
        // Completed rentals are finalized with zero pending actions
        if (r.status === 'completed') {
          continue;
        }

        // Rental agreement invitation pending
        if (r.status === 'invited') {
          actions.push({
            id: `invite-${r._id}`,
            rentalId: r._id,
            title: r.propertyAddress.line1,
            description: isLandlord
              ? `${r.propertyAddress.city} • Waiting for tenant to accept rental invitation`
              : `${r.propertyAddress.city} • Action Required: Rental agreement invitation received`,
            buttonText: isLandlord ? 'View Property' : 'Review & Accept',
            link: `/rentals/${r._id}`,
          });
          continue;
        }

        // Active lease: check if any inspection awaits sign-off
        if (r.status === 'active') {
          try {
            const inspections = await inspectionsApi.getByRental(r._id);
            const moveIn = inspections.find((i) => i.type === 'move_in');
            const moveOut = inspections.find((i) => i.type === 'move_out');

            if (moveIn && moveIn.status !== 'locked') {
              const needsSign = isLandlord ? !moveIn.landlordSigned : !moveIn.tenantSigned;
              if (needsSign) {
                actions.push({
                  id: `movein-${r._id}`,
                  rentalId: r._id,
                  title: r.propertyAddress.line1,
                  description: `${r.propertyAddress.city} • Move-In Baseline awaiting your sign-off`,
                  buttonText: 'Review & Sign',
                  link: `/rentals/${r._id}/inspections/move_in`,
                });
              }
            }

            if (moveOut && moveOut.status !== 'locked') {
              const needsSign = isLandlord ? !moveOut.landlordSigned : !moveOut.tenantSigned;
              if (needsSign) {
                actions.push({
                  id: `moveout-${r._id}`,
                  rentalId: r._id,
                  title: r.propertyAddress.line1,
                  description: `${r.propertyAddress.city} • Move-Out Exit awaiting your sign-off`,
                  buttonText: 'Review & Sign',
                  link: `/rentals/${r._id}/inspections/move_out`,
                });
              }
            }
          } catch {
            // Silently ignore inspection query errors
          }
        }
      }

      setPendingActions(actions);
    } catch {
      setRentals([]);
      setPendingActions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || (isLandlord ? 'Landlord' : 'Tenant')
    : isLandlord ? 'Landlord' : 'Tenant';

  const totalProperties = rentals.length;
  const activeLeases = rentals.filter((r) => r.status === 'active').length;
  const totalDeposit = rentals.reduce((acc, r) => acc + (r.depositAmount || 0), 0);

  const formatCurrencyINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

  // Dynamic Theme by Role - Bright, vibrant, modern colors (no gloomy dark slate)
  const heroGradient = isLandlord
    ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)'
    : 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)';

  const roleBadgeTextColor = isLandlord ? '#1d4ed8' : '#047857';

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Role-Aware Hero Banner */}
      <div style={{
        background: heroGradient,
        color: '#ffffff',
        borderRadius: '16px',
        padding: '2.25rem 2.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: isLandlord
          ? '0 10px 30px -4px rgba(37, 99, 235, 0.28)'
          : '0 10px 30px -4px rgba(5, 150, 105, 0.28)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
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
          <AppLogo size={240} showText={false} />
        </div>

        <div>
          {/* Role Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            background: 'rgba(255, 255, 255, 0.14)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '0.95rem',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <span style={{
              background: '#ffffff',
              color: roleBadgeTextColor,
              padding: '2px 9px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
              {isLandlord ? 'LANDLORD PORTAL' : 'TENANT PORTAL'}
            </span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>
              {isLandlord ? 'Property & Lease Governance' : 'Cryptographic Deposit Safeguard'}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}>
            Welcome, {displayName}
          </h1>

          {/* Subtitle with guaranteed high contrast */}
          <p style={{
            margin: '0.5rem 0 0',
            color: '#e2e8f0',
            fontSize: '0.94rem',
            maxWidth: '560px',
            lineHeight: 1.55,
            fontWeight: 400,
          }}>
            {isLandlord
              ? 'Manage your leased properties, record tamper-proof room condition baselines, and settle security deposits.'
              : 'Your rental deposits and room condition baselines are cryptographically sealed with verifiable proof against unfair deductions.'}
          </p>
        </div>

        {/* Deposit Protection KPI Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '14px',
          padding: '1.25rem 1.75rem',
          textAlign: 'right',
          minWidth: '220px',
        }}>
          <div style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#cbd5e1',
            fontWeight: 700,
          }}>
            {isLandlord ? 'ESCROW DEPOSITS HELD' : 'PROTECTED SECURITY DEPOSIT'}
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            margin: '0.25rem 0',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          }}>
            {formatCurrencyINR(totalDeposit)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
            Across {isLandlord ? `${activeLeases} active lease${activeLeases === 1 ? '' : 's'}` : `${totalProperties} rental home${totalProperties === 1 ? '' : 's'}`}
          </div>
        </div>
      </div>

      {/* Role-Specific KPI Stats Counter */}
      <div className="stat-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-item">
          <div className="stat-label">
            {isLandlord ? 'Properties Managed' : 'Rental Homes'}
          </div>
          <div className="stat-value">{totalProperties}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            {isLandlord ? 'Active Leases' : 'Active Tenancies'}
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>{activeLeases}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            {isLandlord ? 'Total Deposits Held' : 'My Total Deposits'}
          </div>
          <div className="stat-value" style={{ color: '#4f46e5' }}>{formatCurrencyINR(totalDeposit)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            {isLandlord ? 'Pending Reviews' : 'Action Required'}
          </div>
          <div className="stat-value" style={{ color: pendingActions.length > 0 ? '#d97706' : '#059669' }}>
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
            border: '1.5px solid #a7f3d0',
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
            {pendingActions.map((action) => (
              <div
                key={action.id}
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
                      {action.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {action.description}
                    </div>
                  </div>
                </div>

                <Link to={action.link} className="btn btn-primary btn-sm">
                  <span>{action.buttonText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role-Aware Workspaces Hub */}
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
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: isLandlord ? '#eef2ff' : '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLandlord ? '#4f46e5' : '#059669',
                border: isLandlord ? '1px solid #c7d2fe' : '1px solid #a7f3d0',
              }}>
                {isLandlord ? <Building2 size={22} color="#4f46e5" /> : <Home size={22} color="#059669" />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  {isLandlord ? 'Properties & Leases Workspace' : 'My Rentals & Inspections'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                  {isLandlord
                    ? 'Manage property inventory, tenant invitations, and move-in baselines'
                    : 'View rental agreements, inspection checklists, and signed baseline proofs'}
                </div>
              </div>
            </div>
            <ArrowRight size={15} color={isLandlord ? '#4f46e5' : '#059669'} />
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
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                border: '1px solid #fde68a',
              }}>
                <Scale size={22} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  {isLandlord ? 'Disputes & Settlements' : 'Deposit Refunds & Claims'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                  {isLandlord
                    ? 'Itemized deduction claims, counter-offers, and net deposit refunds'
                    : 'Review deduction proposals, submit counter-offers, and verify settlements'}
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
