# AGENTS.md

This file is read automatically by AI agents at the start of every session in this repo. It defines what this frontend project is, how to behave in it, and which skills to use.

---

## 1. Project Overview

**What this is:** **GharProof** (DepositSafe) Frontend is a tamper-proof rental deposit verification and dispute-resolution web application. Landlords and tenants capture locked, SHA-256 timestamped room conditions at move-in and compare them at move-out to eliminate deposit refund disputes with verifiable cryptographic proof.

**Scope:** Strictly **Frontend (FE) Development**. Backend code must NOT be added to this repository.

**Tech stack**
- Runtime: Browser (Node.js LTS for tooling)
- Framework: React 19 (TypeScript)
- Bundler: Vite
- Routing: `react-router-dom`
- HTTP Client: `axios` with typed request/response interceptors
- Icons: `lucide-react`
- Styling: Modern Vanilla CSS with CSS custom properties, glassmorphism, HSL color tokens, dark mode
- Hashing: Browser Native Web Crypto API (`crypto.subtle.digest('SHA-256')`)
- Testing: Vitest + React Testing Library + jsdom

**Key entry points**
- `src/main.tsx` — bootstrap React root, global providers
- `src/App.tsx` — routing structure, layout shell, protected routes
- `src/styles/index.css` — design system tokens, typography, themes
- `src/api/client.ts` — Axios instance with auth interceptor
- `src/context/` — `AuthContext` (JWT session, roles: landlord/tenant) & `ToastContext`
- `src/pages/` — Dashboard, Rentals, Inspections, Comparison, Disputes, Audit Report

**Where the source of truth lives**
- Conventions: `docs/CODEBASE_CONVENTIONS.md` — component structure, styling tokens, hooks, API layer. **Read this before writing or reviewing code.**
- Specifications: `specs/` — frontend architecture, UI/UX design system, screen flows, API mapping.
- Ticket logs: `docs/workspace/tickets/{ID-OR-SLUG}.md` — plans, decisions, blast radius.

---

## 2. How to Use the Skills

These skills are installed in `.agents/skills/`. Use them by name during tasks:

**Starting work**
- New task → **`ticket-kickoff`** (produces acceptance criteria, screen walkthrough, blast radius, edge cases; does NOT write code)
- Picking up / resuming task → **`context-load`** (loads prior decisions and agreed contracts without wasting tokens)

**Doing work**
- Plan approved → **`implement-from-plan`** (incremental implementation one logical unit at a time, checks conventions, runs build/lint)
- Storing progress → **`context-save`** (appends decisions, contracts, and files touched to `docs/workspace/tickets/`)

**Wrapping up**
- Pre-commit review → **`self-review`** (reviews diff for React hooks correctness, types, accessibility, CSS tokens)
- Tests → **`test-companion`** (writes component and hook unit tests with Vitest & RTL)
- What might break → **`regression-check`** (lists caller surfaces, routes, responsive viewports, manual test checklist)
- Performance review → **`optimize-pass`** (finds unnecessary re-renders, missing memoization, bundle size concerns)
- Commit + PR → **`ship-it`** (generates conventional commit message and clean PR description)

---

## 3. Coding Rules

### Must do
- **Use Vanilla CSS with CSS Custom Properties** (`var(--primary)`, `var(--bg-card)`, etc.) defined in `src/styles/`. Keep styling organized, modular, and maintainable.
- **Ensure rich, premium aesthetics** — Glassmorphic cards, smooth micro-interactions, dark/light theme, modern typography (Outfit/Inter), vibrant status badges.
- **Strict TypeScript types** — All API payloads and component props must have explicit interfaces in `src/types/`.
- **Encapsulate all HTTP calls in `src/api/`** — Never make ad-hoc `fetch()` or `axios()` calls directly inside page components.
- **Compute SHA-256 in the browser** using `crypto.subtle.digest` on photo file upload so the user immediately sees verifiable cryptographic hashes before upload.
- **Enforce Inspection Locks visually and logically** — If `status === 'locked'`, disable all edit inputs, photo additions, and item deletions, and display the tamper-proof `rootHash` badge prominently.
- **Handle all async states gracefully** — Every view must handle Loading (spinner/skeleton), Empty (helpful CTA), and Error (retry button, clear message) states.
- **Support both Landlord and Tenant roles** seamlessly with role-specific views, sign-off actions, and dispute workflows.
- **Run `npm run build` and `npm run lint`** before finishing any task.

### Never do
- **Never use TailwindCSS** unless explicitly requested by the user.
- **Never use `any` type** in TypeScript.
- **Never hardcode API base URLs** — always use `import.meta.env.VITE_API_BASE_URL`.
- **Never expose raw passwords or sensitive credentials** in client-side logs or storage.
- **Never allow mutation of locked inspections or room items**.
- **Never run `git commit` or `git push` automatically**.

---

## 4. Tamper-Proofing & Inspection Workflow Rules

- **Client Hashing**: Photos selected for inspection items must compute their SHA-256 hash immediately in the browser.
- **Dual Sign-Off**: The UI displays both Landlord and Tenant sign-off cards. When both parties sign, the inspection displays the composite `rootHash` badge and enters immutable locked mode.
- **Comparison Engine**: Visually highlights unchanged vs damaged items with side-by-side move-in and move-out photos and diff status chips.
- **Settlement Calculator**: Displays interactive deposit reconciliation: Original Deposit minus Agreed Deductions equals Refund Amount.
