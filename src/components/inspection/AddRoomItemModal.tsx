import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { ItemCondition } from '../../types';
import { uploadApi } from '../../api/upload.api';
import { getPhotoUrl } from '../../utils/photo.util';
import { HashBadge } from '../common/HashBadge';
import { Upload, AlertCircle } from 'lucide-react';

interface AddRoomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: {
    roomName: string;
    itemName: string;
    condition: ItemCondition;
    notes?: string;
    photos?: string[];
  }) => Promise<void>;
}

export const AddRoomItemModal: React.FC<AddRoomItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [roomName, setRoomName] = useState('Living Room');
  const [itemName, setItemName] = useState('');
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

  const predefinedRooms = ['Living Room', 'Master Bedroom', 'Bedroom 2', 'Kitchen', 'Bathroom', 'Balcony', 'Hallway'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const files = Array.from(e.target.files);
      const newItems: { uploadId: string; photoUrl: string; sha256Hash: string; fileName: string }[] = [];

      for (const file of files) {
        // Upload to backend to obtain verified Upload record with _id and sha256Hash
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
    if (!itemName.trim()) {
      setError('Please provide an item name');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        roomName,
        itemName,
        condition,
        notes: notes.trim() || undefined,
        photos: selectedPhotos.map((p) => p.uploadId),
      });
      setItemName('');
      setNotes('');
      setSelectedPhotos([]);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save item';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Checklist Item" maxWidth="520px">
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

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Room Area</label>
            <select
              className="form-select"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            >
              {predefinedRooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Item / Fixture</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Geyser, Wardrobe"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Condition</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
            {(['good', 'fair', 'poor', 'damaged'] as ItemCondition[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                style={{
                  padding: '0.45rem 0.35rem',
                  borderRadius: 'var(--radius-xs)',
                  border: condition === c ? '1px solid var(--color-brand-primary)' : '1px solid var(--border-medium)',
                  background: condition === c ? 'var(--color-brand-primary)' : '#ffffff',
                  color: condition === c ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: condition === c ? 600 : 400,
                  fontSize: '0.82rem',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Existing scratches, brand, comments"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Attach Photos</label>
          <div style={{
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            textAlign: 'center',
            background: 'var(--bg-app)',
          }}>
            <Upload size={20} color="var(--text-tertiary)" style={{ margin: '0 auto 0.4rem' }} />
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <span>{isUploading ? 'Uploading & Hashing...' : 'Choose Photos'}</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.65rem' }}>
              {selectedPhotos.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: '#ffffff',
                    padding: '0.4rem 0.6rem',
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
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.fileName}
                    </div>
                    <HashBadge hash={p.sha256Hash} prefix="SHA-256" />
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary btn-sm">
            {isSubmitting ? 'Saving...' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
