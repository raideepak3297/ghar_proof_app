import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettlementCalculator } from '../components/disputes/SettlementCalculator';
import { Dispute } from '../types';

describe('SettlementCalculator', () => {
  it('calculates refund subtracting agreed deductions', () => {
    const mockDisputes: Dispute[] = [
      {
        _id: 'd1',
        rentalId: 'r1',
        category: 'damage',
        proposedDeduction: 5000,
        description: 'Broken window',
        tenantStatus: 'accepted',
        status: 'accepted',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    render(<SettlementCalculator depositAmount={50000} disputes={mockDisputes} />);

    // 50,000 - 5,000 = 45,000
    expect(screen.getByText(/Estimated Refund/i)).toBeInTheDocument();
    expect(screen.getByText(/Agreed Deductions/i)).toBeInTheDocument();
  });
});
