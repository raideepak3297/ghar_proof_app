import React, { useState } from 'react';
import type { ComparisonItem, ComparisonResult } from '../../types';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, ShieldCheck, Scale, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { getPhotoUrl, getPhotoHash, getPhotoName } from '../../utils/photo.util';

interface ComparisonDiffTableProps {
  comparison: ComparisonResult;
  rentalId: string;
}

export const ComparisonDiffTable: React.FC<ComparisonDiffTableProps> = ({ comparison, rentalId }) => {
  const { summary, comparisons } = comparison;
  const [activePhoto, setActivePhoto] = useState<{
    url: string;
    hash?: string;
    name?: string;
    title?: string;
    condition?: any;
    notes?: string;
  } | null>(null);

  return (
    <div>
      <div className="grid-3" style={{ marginBottom: '2rem', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-verified)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{summary.unchanged}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Items Unchanged (Good)</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{summary.damaged}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Damaged Since Move-In</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{summary.disputed}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Under Negotiation</div>
          </div>
        </div>
      </div>

      {comparisons.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3.5rem 1.5rem", background: "var(--bg-surface)" }}>
          <CheckCircle2 size={40} color="var(--color-verified)" style={{ margin: "0 auto 1rem" }} />
          <h3>No Condition Differences Recorded</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "0.35rem" }}>
            All room items have identical verified condition between move-in baseline and move-out exit.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {comparisons.map((item: ComparisonItem, idx: number) => {
            const isDamaged = item.diffStatus === 'damaged_since_move_in';
            const isDisputed = item.diffStatus === 'disputed';

            const moveInPhotos = item.moveIn?.photos || item.moveIn?.photoUrls || [];
            const moveOutPhotos = item.moveOut?.photos || item.moveOut?.photoUrls || [];

            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.35rem',
                  border: isDamaged
                    ? '1.5px solid rgba(239, 68, 68, 0.4)'
                    : isDisputed
                    ? '1.5px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {item.roomName}
                    </span>
                    <span style={{ color: 'var(--border-medium)' }}>/</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.itemName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={isDamaged ? 'damaged' : isDisputed ? 'disputed' : 'unchanged'} />
                    {isDamaged && (
                      <Link
                        to={`/rentals/${rentalId}/disputes`}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                      >
                        <Scale size={13} />
                        <span>Propose Deduction</span>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  {/* Move-In Baseline Card */}
                  <div style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-verified)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={14} /> Move-In Baseline
                      </span>
                      {item.moveIn && <Badge variant={item.moveIn.condition} />}
                    </div>

                    {/* Move-In Photos */}
                    {moveInPhotos.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '0.65rem', paddingBottom: '0.25rem' }}>
                        {moveInPhotos.map((photo: any, pIdx: number) => {
                          const pUrl = getPhotoUrl(photo);
                          const pHash = getPhotoHash(photo);
                          const pName = getPhotoName(photo);

                          return (
                            <div
                              key={pIdx}
                              onClick={() => {
                                if (pUrl) {
                                  setActivePhoto({
                                    url: pUrl,
                                    hash: pHash,
                                    name: pName,
                                    title: `Move-In Baseline: ${item.roomName} • ${item.itemName}`,
                                    condition: item.moveIn?.condition,
                                    notes: item.moveIn?.notes,
                                  });
                                }
                              }}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1.5px solid #cbd5e1',
                                position: 'relative',
                                width: moveInPhotos.length === 1 ? '100%' : '140px',
                                height: '120px',
                                flexShrink: 0,
                                background: '#0f172a',
                              }}
                              title="Click to inspect move-in photo evidence"
                            >
                              <img
                                src={pUrl}
                                alt={`Move-In ${item.itemName}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                left: '4px',
                                background: 'rgba(15, 23, 42, 0.75)',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <Eye size={10} />
                                <span>Inspect</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        color: 'var(--text-tertiary)',
                        textAlign: 'center',
                        marginBottom: '0.65rem',
                        border: '1px dashed var(--border-medium)',
                      }}>
                        No move-in photos attached
                      </div>
                    )}

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                      {item.moveIn?.notes || 'No notes recorded'}
                    </p>
                  </div>

                  {/* Move-Out Exit State Card */}
                  <div style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-brand-accent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ArrowRight size={14} /> Move-Out Exit State
                      </span>
                      {item.moveOut && <Badge variant={item.moveOut.condition} />}
                    </div>

                    {/* Move-Out Photos */}
                    {moveOutPhotos.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '0.65rem', paddingBottom: '0.25rem' }}>
                        {moveOutPhotos.map((photo: any, pIdx: number) => {
                          const pUrl = getPhotoUrl(photo);
                          const pHash = getPhotoHash(photo);
                          const pName = getPhotoName(photo);

                          return (
                            <div
                              key={pIdx}
                              onClick={() => {
                                if (pUrl) {
                                  setActivePhoto({
                                    url: pUrl,
                                    hash: pHash,
                                    name: pName,
                                    title: `Move-Out Exit: ${item.roomName} • ${item.itemName}`,
                                    condition: item.moveOut?.condition,
                                    notes: item.moveOut?.notes,
                                  });
                                }
                              }}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1.5px solid #cbd5e1',
                                position: 'relative',
                                width: moveOutPhotos.length === 1 ? '100%' : '140px',
                                height: '120px',
                                flexShrink: 0,
                                background: '#0f172a',
                              }}
                              title="Click to inspect move-out photo evidence"
                            >
                              <img
                                src={pUrl}
                                alt={`Move-Out ${item.itemName}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                left: '4px',
                                background: 'rgba(15, 23, 42, 0.75)',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                <Eye size={10} />
                                <span>Inspect</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        color: 'var(--text-tertiary)',
                        textAlign: 'center',
                        marginBottom: '0.65rem',
                        border: '1px dashed var(--border-medium)',
                      }}>
                        No move-out photos attached
                      </div>
                    )}

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                      {item.moveOut?.notes || 'No notes recorded'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Evidence Modal */}
      {activePhoto && (
        <PhotoViewerModal
          isOpen={!!activePhoto}
          onClose={() => setActivePhoto(null)}
          photoUrl={activePhoto.url}
          sha256Hash={activePhoto.hash}
          fileName={activePhoto.name}
          title={activePhoto.title}
          condition={activePhoto.condition}
          notes={activePhoto.notes}
        />
      )}
    </div>
  );
};
