import React, { useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { truncateHash } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface HashBadgeProps {
  hash: string;
  prefix?: string;
  full?: boolean;
}

export const HashBadge: React.FC<HashBadgeProps> = ({ hash, prefix = 'SHA-256', full = false }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast('SHA-256 hash copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className="hash-badge"
      title={`Click to copy full cryptographic hash:\n${hash}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCopy(e as unknown as React.MouseEvent);
        }
      }}
    >
      <ShieldCheck size={13} color="var(--color-brand-accent)" />
      {prefix && <span style={{ opacity: 0.7 }}>{prefix}:</span>}
      <span style={{ fontWeight: 600 }}>{full ? hash : truncateHash(hash, 7)}</span>
      {copied ? <Check size={12} color="var(--color-verified)" /> : <Copy size={11} style={{ opacity: 0.6 }} />}
    </div>
  );
};
