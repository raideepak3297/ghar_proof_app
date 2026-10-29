import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { comparisonApi } from '../api/comparison.api';
import { rentalsApi } from '../api/rentals.api';
import type { ComparisonResult, Rental } from '../types';
import { ComparisonDiffTable } from '../components/comparison/ComparisonDiffTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, FileText, Scale } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ComparisonPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!rentalId) return;
    Promise.all([
      comparisonApi.getByRentalId(rentalId),
      rentalsApi.getById(rentalId),
    ])
      .then(([compData, rentalData]) => {
        setComparison(compData);
        setRental(rentalData);
      })
      .catch(() => toast('Failed to load comparison', 'error'))
      .finally(() => setLoading(false));
  }, [rentalId, toast]);

  if (loading) return <LoadingSpinner message="Calculating condition diff..." />;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to={`/rentals/${rentalId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.85rem',
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Property</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 600 }}>Condition Comparison Engine</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Side-by-side verification of {rental?.propertyAddress.line1} between move-in baseline and move-out exit.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to={`/rentals/${rentalId}/disputes`} className="btn btn-secondary btn-sm">
              <Scale size={14} />
              <span>Disputes & Deductions</span>
            </Link>
            <Link to={`/rentals/${rentalId}/report`} className="btn btn-primary btn-sm">
              <FileText size={14} />
              <span>Audit Certificate</span>
            </Link>
          </div>
        </div>
      </div>

      {comparison && rentalId && (
        <ComparisonDiffTable comparison={comparison} rentalId={rentalId} />
      )}
    </div>
  );
};
