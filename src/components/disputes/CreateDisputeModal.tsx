import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { DeductionCategory } from '../../types';
import { AlertCircle } from 'lucide-react';

interface CreateDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: DeductionCategory;
    proposedDeduction: number;
    description: string;
    evidencePhotoUrls?: string[];
  }) => Promise<void>;
}

export const CreateDisputeModal: React.FC<CreateDisputeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState<DeductionCategory>('damage');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { label: string; value: DeductionCategory }[] = [
    { label: 'Physical Damage', value: 'damage' },
    { label: 'Deep Cleaning Fee', value: 'cleaning' },
    { label: 'Unpaid Utilities / Bills', value: 'unpaid_utility' },
    { label: 'Missing Inventory Item', value: 'missing_item' },
    { label: 'Other Settlement', value: 'other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Deduction amount must be greater than zero');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a reason / itemized description');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        category,
        proposedDeduction: Number(amount),
        description,
      });
      setDescription('');
      setAmount('');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to propose deduction';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Propose Deposit Deduction">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Deduction Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as DeductionCategory)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Proposed Deduction Amount (₹ INR)</label>
          <input
            type="number"
            min={1}
            className="form-input"
            value={amount}
            placeholder="e.g. 2500"
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reason & Quotation Details</label>
          <textarea
            className="form-textarea"
            placeholder="Explain why this deduction is necessary (e.g. plumber invoice, broken tap fixture cost)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Submitting...' : 'Submit Proposed Deduction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
