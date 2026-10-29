---
name: test-companion
description: Use when the user wants to add or update tests for recent React/TypeScript changes. Generates component and hook tests using Vitest and React Testing Library, mocks API calls via Vitest vi.mock, runs the suite, and iterates until all pass.
---

# Test Companion

## What to do
1. Identify components, hooks, or utilities modified.
2. Follow RTL best practices:
   - Query by accessible role (`screen.getByRole`) or test-id.
   - Test user interactions via `fireEvent` or `userEvent`.
   - Mock API layer responses cleanly.
3. Run tests using `npm test`.
4. Ensure 100% green test suite.
