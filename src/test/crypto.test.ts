import { describe, it, expect } from 'vitest';
import { computeTextSha256 } from '../utils/crypto';

describe('crypto utils', () => {
  it('computes correct SHA-256 for known text', async () => {
    // "hello world" -> b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    const hash = await computeTextSha256('hello world');
    expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('produces 64-char hex string', async () => {
    const hash = await computeTextSha256('GharProof-Inspection-Item');
    expect(hash).toHaveLength(64);
  });
});
