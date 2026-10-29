import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Dispute } from '../../types';
import { formatCurrencyINR } from '../../utils/formatters';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface DisputeActionModalProps {
  isOpen: boolean;
  dispute: Dispute | null;
  onClose: () => void;
  onSubmit: (disputeId: string, data: {
    tenantStatus: 'accepted' | 'disputed';
    tenantComment?: string;
    counterAmount?: number;
  }) => Promise<void>;
}

export const DisputeActionModal: React.FC<DisputeActionModalProps> = ({
  isOpen,
  dispute,
  onClose,
  onSubmit,
}) => {
  const [decision, setDecision] = useState<'accepted' | 'disputed'>('accepted');
  const [comment, setComment] = useState('');
  const [counterAmount, setCounterAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dispute) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(dispute._id, {
        tenantStatus: decision,
        tenantComment: comment,
        counterAmount: decision === 'disputed' ? counterAmount : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Respond to Proposed Deduction">
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--bg-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Category: {dispute.category}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger)', margin: '0.25rem 0' }}>
            {formatCurrencyINR(dispute.proposedDeduction)}
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {dispute.description}
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Your Decision</label>
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setDecision('accepted')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: decision === 'accepted' ? '2px solid var(--color-verified)' : '1px solid var(--border-medium)',
                background: decision === 'accepted' ? 'var(--color-verified-bg)' : 'var(--bg-input)',
                color: decision === 'accepted' ? 'var(--color-verified)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Accept Deduction</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDecision('disputed');
                
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: decision === 'disputed' ? '2px solid var(--color-warning)' : '1px solid var(--border-medium)',
                background: decision === 'disputed' ? 'var(--color-warning-bg)' : 'var(--bg-input)',
                color: decision === 'disputed' ? 'var(--color-warning)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <AlertTriangle size={16} />
              <span>Dispute / Counter</span>
            </button>
          </div>
        </div>

        {decision === 'disputed' && (
          <div className="form-group">
            <label className="form-label">Fair Counter Offer Amount (₹ INR)</label>
            <input
              type="number"
              min={0}
              max={dispute.proposedDeduction}
              className="form-input"
              value={counterAmount}
              onChange={(e) => setCounterAmount(Number(e.target.value))}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Your Comments / Explanation</label>
          <textarea
            className="form-textarea"
            placeholder={decision === 'accepted' ? 'Optional agreement remarks' : 'Explain why this should be considered normal wear & tear, or provide justification'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
