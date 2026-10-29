---
name: optimize-pass
description: Use when the user wants optimization suggestions for React frontend changes. Looks for redundant re-renders, missing memoization, unoptimized bundle imports, layout shifts, uncompressed assets, and excessive DOM nodes.
---

# Frontend Optimize Pass

## What to do
1. Check bundle size impact and code-splitting opportunities (`React.lazy`).
2. Identify excessive component re-renders.
3. Verify CSS layout performance (avoid expensive layout thrashing).
4. Categorize into `Safe` optimizations vs `Proposals`.
