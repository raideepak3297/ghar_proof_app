import React from 'react';

export interface BadgeProps {
  variant: 'draft' | 'locked' | 'good' | 'fair' | 'poor' | 'damaged' | 'disputed' | 'unchanged' | 'pending' | 'success' | 'danger' | 'warning' | 'minor_scratch' | 'not_working';
  label?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label, children }) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'locked':
      case 'good':
      case 'success':
        return 'badge-verified';
      case 'disputed':
      case 'damaged':
      case 'poor':
      case 'danger':
      case 'not_working':
        return 'badge-danger';
      case 'warning':
      case 'pending':
      case 'fair':
      case 'minor_scratch':
        return 'badge-warning';
      case 'unchanged':
        return 'badge-info';
      case 'draft':
      default:
        return 'badge-neutral';
    }
  };

  const displayText = children || label || variant;

  return <span className={`badge ${getBadgeClass()}`}>{displayText}</span>;
};
