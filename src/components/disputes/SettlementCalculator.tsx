import React from 'react';
import type { Dispute } from '../../types';
import { formatCurrencyINR } from '../../utils/formatters';
import { Calculator } from 'lucide-react';

interface SettlementCalculatorProps {
  depositAmount: number;
  disputes: Dispute[];
}

export const SettlementCalculator: React.FC<SettlementCalculatorProps> = ({ depositAmount, disputes }) => {
  const agreedDeductions = disputes
    .filter((d) => d.status === 'accepted' || d.tenantStatus === 'accepted')
    .reduce((sum, d) => sum + d.proposedDeduction, 0);

  const pendingDeductions = disputes
    .filter((d) => d.status === 'proposed' || d.status === 'disputed' || d.tenantStatus === 'pending')
    .reduce((sum, d) => sum + (d.counterAmount || d.proposedDeduction), 0);

  const netRefundAmount = Math.max(0, depositAmount - agreedDeductions);

  return (
    <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-brand-primary-hover)' }}>
          <Calculator size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Deposit Settlement Breakdown</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Calculated in real time based on agreed deduction claims</p>
        </div>
      </div>

      <div className="grid-4" style={{ gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ padding: '1rem 1.15rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Original Deposit
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {formatCurrencyINR(depositAmount)}
          </div>
        </div>

        <div style={{ padding: '1rem 1.15rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Agreed Deductions
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-danger)', marginTop: '0.25rem' }}>
            - {formatCurrencyINR(agreedDeductions)}
          </div>
        </div>

        <div style={{ padding: '1rem 1.15rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            In Dispute
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
            {formatCurrencyINR(pendingDeductions)}
          </div>
        </div>

        <div style={{
          padding: '1rem 1.15rem',
          background: 'rgba(16, 185, 129, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-verified-border)',
        }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-verified)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            Estimated Refund
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-verified)', marginTop: '0.25rem' }}>
            {formatCurrencyINR(netRefundAmount)}
          </div>
        </div>
      </div>
    </div>
  );
};
