import React from 'react';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  showText = false,
  className = '',
}) => {
  return (
    <div className={`app-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(79, 70, 229, 0.25))' }}
      >
        <defs>
          {/* Vibrant FinTech Gradient (Electric Indigo to Vivid Emerald) */}
          <linearGradient id="gharProofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="55%" stopColor="#4338ca" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          {/* Subtle Top Specular Shine */}
          <linearGradient id="gharProofShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Cryptographic Security Shield */}
        <path
          d="M20 3 C27.5 3 35.5 6.8 35.5 14.5 C35.5 25.8 26.2 33.8 20 37 C13.8 33.8 4.5 25.8 4.5 14.5 C4.5 6.8 12.5 3 20 3 Z"
          fill="url(#gharProofGrad)"
        />
        {/* Subtle Inner Bevel / Glow */}
        <path
          d="M20 4.2 C26.8 4.2 34 7.6 34 14.5 C34 24.8 25.4 32.2 20 35.3 C14.6 32.2 6 24.8 6 14.5 C6 7.6 13.2 4.2 20 4.2 Z"
          fill="url(#gharProofShine)"
        />

        {/* House Contour ("Ghar") */}
        {/* Roof */}
        <path
          d="M12.5 18.5 L20 12 L27.5 18.5"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Walls & Base */}
        <path
          d="M14.5 18 V25.5 C14.5 26.3 15.2 27 16 27 H24 C24.8 27 25.5 26.3 25.5 25.5 V18"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(255, 255, 255, 0.12)"
        />

        {/* Verified Tamper-Proof Checkmark ("Proof") */}
        <path
          d="M17.2 21.8 L19.4 24 L23.2 19.6"
          stroke="#34d399"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: `${size * 0.52}px`,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          Ghar<span style={{ color: '#4f46e5' }}>Proof</span>
        </span>
      )}
    </div>
  );
};
