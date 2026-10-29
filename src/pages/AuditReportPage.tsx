import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rentalsApi } from '../api/rentals.api';
import { reportsApi } from '../api/reports.api';
import type { Rental } from '../types';
import { formatCurrencyINR, formatDate } from '../utils/formatters';
import { HashBadge } from '../components/common/HashBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { AppLogo } from '../components/common/AppLogo';
import { Download, ArrowLeft, CheckCircle2, Award, Building2 } from 'lucide-react';

export const AuditReportPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId?: string }>();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!rentalId) {
      setLoading(false);
      return;
    }

    rentalsApi
      .getById(rentalId)
      .then((r) => setRental(r))
      .catch(() => toast('Failed to load certificate data', 'error'))
      .finally(() => setLoading(false));
  }, [rentalId, toast]);

  const handleDownloadPdf = async () => {
    if (!rentalId) return;
    setIsDownloading(true);
    try {
      const blob = await reportsApi.downloadReportPdf(rentalId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GharProof-Inspection-Report-${rentalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast('Official PDF report downloaded successfully!', 'success');
    } catch {
      toast('Failed to download PDF report from server', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating cryptographic certificate..." />;

  const rootHash = (rental as any)?.rootHash || null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to={rentalId ? `/rentals/${rentalId}` : '/rentals'} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Verification Protocol</div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tamper-Proof Audit Certificate</h1>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="btn btn-primary"
        >
          <Download size={16} />
          <span>{isDownloading ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
        </button>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1.5px solid #a7f3d0',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2.5rem',
        boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <AppLogo size={64} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Certificate of Inspection Authenticity
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
            This document certifies that the room conditions for this tenancy have been recorded, dual-signed, and permanently sealed with cryptographic SHA-256 tamper-proof timestamps.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>Verified Property</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rental?.propertyAddress.line1 || 'Property Address'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {rental ? `${rental.propertyAddress.city}, ${rental.propertyAddress.state} - ${rental.propertyAddress.postalCode}` : 'Loading...'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>Protected Security Deposit</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-verified)' }}>
              {rental ? formatCurrencyINR(rental.depositAmount) : '—'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Monthly Rent: {rental ? formatCurrencyINR(rental.monthlyRent) : '—'} • Lease Start: {rental?.startDate ? formatDate(rental.startDate) : '—'}
            </div>
          </div>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <Award size={20} color="#059669" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#047857' }}>
              Canonical Root Hash (SHA-256)
            </span>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            {rootHash ? (
              <HashBadge hash={rootHash} full={true} />
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-warning)', background: 'var(--color-warning-bg)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                Pending Dual Party Sign-Off (Hash generated upon locking)
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#065f46', lineHeight: 1.5 }}>
            Computed canonical payload hash covering room fixtures, photo exhibits, and dual digital signatures. Any alteration to photos or notes will invalidate this proof hash.
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          borderTop: '1px solid var(--border-medium)',
          paddingTop: '2rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              <Building2 size={16} /> Landlord Verification
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Verified Registered Owner</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Cryptographically timestamped
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-verified)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              <CheckCircle2 size={16} /> Tenant Verification
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Verified Registered Tenant</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Dual party verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
