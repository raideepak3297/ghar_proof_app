---
name: self-review
description: Use when the user wants a code review on recent React/TypeScript changes before committing. Reviews the diff plus surrounding files for correctness, React conventions (hooks, keys, unneeded re-renders), accessibility, CSS design system token compliance, and security. Outputs Blockers / Should-fix / Nits.
---

# Frontend Self Review

## Checklist
1. **React & Hooks**:
   - Are `useEffect` dependencies exhaustive and accurate?
   - Are expensive calculations wrapped in `useMemo` where appropriate?
   - Are callbacks passed to memoized children wrapped in `useCallback`?
   - Are list elements provided stable, unique `key` props (never array indexes for mutable lists)?
2. **TypeScript & Types**:
   - Zero `any` types. Strict null checks handled.
   - Types match backend API schemas in `src/types/`.
3. **Design System & CSS**:
   - Pure Vanilla CSS using custom properties (`var(--primary)`, etc.).
   - Responsive on mobile, tablet, and desktop viewports.
   - Loading skeletons/spinners for async actions.
4. **Security & Data**:
   - Tokens stored securely, sanitized user inputs.
   - SHA-256 hashes verified client-side using Web Crypto.
5. **Output**: Categorized into `[Blocker]`, `[Should-Fix]`, `[Nit]`.
