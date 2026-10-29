import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/common/Badge';

describe('Badge', () => {
  it('renders locked badge label', () => {
    render(<Badge variant="locked" />);
    expect(screen.getByText('locked')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<Badge variant="good" label="Pristine Condition" />);
    expect(screen.getByText('Pristine Condition')).toBeInTheDocument();
  });
});
