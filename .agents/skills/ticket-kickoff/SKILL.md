---
name: ticket-kickoff
description: Use at the start of a frontend task in this React/TypeScript project. Trigger when the user pastes a ticket, describes a feature/bug in prose, or says they're "picking up" something new. Produces acceptance criteria, screen & component walkthrough (pages, hooks, state, styling, API contracts), blast-radius analysis (consumer components, routes, shared contexts), edge cases, risks, and clarifying questions. Does NOT write code. Saves the plan to the shared context store.
---

# Frontend Ticket Kickoff

## What to do

1. **Identify the work.** Read whatever the user pasted — a ticket, design requirement, or bug report. Extract or generate a short kebab-case slug (e.g., `comparison-diff-viewer`).

2. **Check existing context first** (token-saver). Look in `docs/workspace/tickets/` — if a file already exists for this ID/slug, read it first.

3. **Read `docs/CODEBASE_CONVENTIONS.md` first** — ensures naming, component breakdown, styling tokens, hook patterns, and API integration align with production standards.

4. **Explore the repo independently.** Check:
   - `src/pages/` for existing route pages
   - `src/components/` for reusable and domain-specific UI components
   - `src/hooks/` and `src/context/` for state management & shared logic
   - `src/api/` and `src/types/` for data contracts with the backend
   - `src/styles/` for CSS tokens and variables

5. **Produce the walkthrough in this exact structure:**
   - **Task:** {slug} — {one-line title}
   - **Acceptance criteria:** bullet list with `[needs confirmation]` for ambiguities.
   - **Components & Files to change:**
     - *Pages:* `src/pages/...`
     - *Components:* `src/components/...`
     - *State/Hooks:* `src/context/...`, `src/hooks/...`
     - *API/Types:* `src/api/...`, `src/types/...`
     - *Styles:* `src/styles/...`
   - **Logic & UX flow:** Interaction state, validations, loading/error states, responsive behavior.
   - **Blast radius:** Route changes, shared context updates, prop changes on reusable components.
   - **Edge cases:** Empty lists, network latency, offline/error states, mobile viewports, image load failures.
   - **Risks:** Breaking backend contract mismatch, unmemoized rerenders, accessibility gaps.
   - **Clarifying questions:** Any design, copy, or contract questions. Ask BEFORE writing code.

6. **Do NOT write code.** Wait for user approval.
7. After approval, save the plan via `context-save` skill into `docs/workspace/tickets/{slug}.md`.
