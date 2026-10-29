import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ShieldCheck, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Badge } from './Badge';

export interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  fileName?: string;
  sha256Hash?: string;
  title?: string;
  condition?: any;
  notes?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  fileName,
  sha256Hash,
  title,
  condition,
  notes,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setImageError(false);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, photoUrl, onClose]);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard.writeText(sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                {title || 'Inspection Photo Evidence'}
              </span>
              {condition && <Badge variant={condition} />}
            </div>
            {fileName && (
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                {fileName}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              title="Open full size in new tab"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <ExternalLink size={13} />
              <span>Full Size</span>
            </a>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.35rem', borderRadius: '50%' }}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div style={{
          flex: 1,
          minHeight: '320px',
          maxHeight: '62vh',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '0.5rem',
        }}>
          {!imageLoaded && !imageError && (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Loading high-resolution evidence...
            </div>
          )}

          {imageError ? (
            <div style={{ textAlign: 'center', color: '#f87171', padding: '2rem' }}>
              <ImageIcon size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Unable to display image preview</div>
              <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                The evidence file may not exist on server storage.
              </div>
            </div>
          ) : (
            <img
              src={photoUrl}
              alt={title || 'Inspection item'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '6px',
                display: imageLoaded ? 'block' : 'none',
              }}
            />
          )}
        </div>

        {/* Cryptographic Proof & Details Footer */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {notes && (
            <div style={{ fontSize: '0.84rem', color: '#334155' }}>
              <strong>Item Notes:</strong> {notes}
            </div>
          )}

          {sha256Hash && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: '#ffffff',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SHA-256 Hash
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  color: '#0284c7',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {sha256Hash}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyHash}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
              >
                {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
