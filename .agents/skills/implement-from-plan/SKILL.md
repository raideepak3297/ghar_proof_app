---
name: implement-from-plan
description: Use after a frontend ticket-kickoff plan has been approved and it's time to write React/TypeScript code. Implements the plan incrementally one logical unit at a time, follows existing component/hook/style/API conventions in the repo, runs build and lint, and pauses on ambiguity instead of guessing.
---

# Implement From Plan

## What to do

1. Read approved plan in `docs/workspace/tickets/{slug}.md`.
2. Break work into logical units:
   - Unit 1: Data types & API client endpoints
   - Unit 2: Shared UI components & design system tokens
   - Unit 3: Feature components & state hooks
   - Unit 4: Page assembly, routing & responsive layout
   - Unit 5: Edge cases, error handling, loading skeletons
3. Implement each unit carefully:
   - Match TypeScript strict mode
   - Use CSS custom properties from design system
   - Keep components focused and accessible
4. Run `npm run build` and `npm run lint`.
5. Run tests with `npm test`.
