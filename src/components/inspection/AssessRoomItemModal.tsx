import React, { useState, useEffect } from 'react';
import type { RoomItem, ItemCondition } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Upload, AlertCircle, ShieldCheck, Camera } from 'lucide-react';
import { uploadApi } from '../../api/upload.api';
import { getPhotoUrl, getPhotoHash, getPhotoName } from '../../utils/photo.util';

export interface AssessRoomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RoomItem | null;
  baselineItem?: RoomItem | null;
  onSave: (itemId: string, data: {
    condition: ItemCondition;
    notes?: string;
    photos?: string[];
  }) => Promise<void>;
}

export const AssessRoomItemModal: React.FC<AssessRoomItemModalProps> = ({
  isOpen,
  onClose,
  item,
  baselineItem,
  onSave,
}) => {
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [notes, setNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<{
    uploadId: string;
    photoUrl: string;
    sha256Hash: string;
    fileName: string;
  }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && isOpen) {
      setCondition(item.condition || 'good');
      setNotes(item.notes || '');
      // If item already has checkout photos, populate them
      const initialPhotos = (item.photos || []).map((p: any) => ({
        uploadId: typeof p === 'string' ? p : (p._id || p.id),
        photoUrl: getPhotoUrl(p),
        sha256Hash: getPhotoHash(p),
        fileName: getPhotoName(p),
      }));
      setSelectedPhotos(initialPhotos);
      setError(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const baselinePhotos = baselineItem?.photos || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const files = Array.from(e.target.files);
      const newItems: { uploadId: string; photoUrl: string; sha256Hash: string; fileName: string }[] = [];

      for (const file of files) {
        const uploadRes = await uploadApi.uploadFile(file);
        newItems.push({
          uploadId: uploadRes._id,
          photoUrl: getPhotoUrl(uploadRes._id),
          sha256Hash: uploadRes.sha256Hash,
          fileName: file.name,
        });
      }
      setSelectedPhotos((prev) => [...prev, ...newItems]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(item._id, {
        condition,
        notes: notes.trim() || undefined,
        photos: selectedPhotos.map((p) => p.uploadId),
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save checkout assessment';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assess Checkout: ${item.roomName} • ${item.itemName}`}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Move-In Baseline Reference Banner */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} color="#16a34a" />
              <span>Move-In Baseline Reference</span>
            </span>
            {baselineItem && <Badge variant={baselineItem.condition} />}
          </div>

          {baselinePhotos.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '0.5rem', paddingBottom: '0.2rem' }}>
              {baselinePhotos.map((p: any, idx: number) => {
                const src = getPhotoUrl(p);
                return (
                  <div
                    key={idx}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #86efac',
                      background: '#0f172a',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={src}
                      alt="Baseline"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#15803d', fontStyle: 'italic', marginBottom: '0.4rem' }}>
              No move-in photos attached at baseline.
            </div>
          )}

          <div style={{ fontSize: '0.8rem', color: '#14532d' }}>
            <strong>Baseline Notes:</strong> {baselineItem?.notes || 'No baseline notes recorded'}
          </div>
        </div>

        {/* Checkout Condition Selection */}
        <div className="form-group" style={{ marginBottom: '1.1rem' }}>
          <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Camera size={14} color="#0284c7" />
            <span>Move-Out Checkout Condition</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {(['good', 'minor_scratch', 'damaged', 'not_working'] as ItemCondition[]).map((c) => {
              const isSelected = condition === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  style={{
                    padding: '0.55rem 0.35rem',
                    borderRadius: 'var(--radius-xs)',
                    border: isSelected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--border-medium)',
                    background: isSelected ? 'var(--color-brand-primary)' : '#ffffff',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.82rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {c.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Checkout Notes */}
        <div className="form-group" style={{ marginBottom: '1.1rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Checkout Assessment Notes</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Scratches observed on left handle during walkthrough"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Attach Move-Out Checkout Photos */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Attach Checkout Photos (Evidence)</label>
          <div style={{
            border: '1.5px dashed var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            textAlign: 'center',
            background: 'var(--bg-app)',
          }}>
            <Upload size={20} color="var(--text-tertiary)" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Upload current photo proof taken during checkout inspection
            </div>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <span>{isUploading ? 'Uploading & Hashing...' : 'Choose Checkout Photos'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {selectedPhotos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.65rem' }}>
              {selectedPhotos.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: '#ffffff',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <img
                    src={p.photoUrl}
                    alt="Preview"
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.fileName}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#059669',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        marginTop: '2px',
                      }}
                      title={`Cryptographic SHA-256 Hash:\n${p.sha256Hash}`}
                    >
                      <ShieldCheck size={13} color="#059669" />
                      <span>Tamper-Proof Encrypted</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary btn-sm">
            {isSubmitting ? 'Saving Assessment...' : 'Save Checkout Assessment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
