import { describe, it, expect } from 'vitest';
import { formatCurrencyINR, truncateHash } from '../utils/formatters';

describe('formatters', () => {
  it('formats currency in INR', () => {
    const formatted = formatCurrencyINR(96000);
    expect(formatted).toContain('96,000');
  });

  it('truncates 64-character hash properly', () => {
    const fullHash = '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4';
    const truncated = truncateHash(fullHash, 7);
    expect(truncated).toBe('8f43434...c327aa4');
  });
});
