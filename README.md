# GharProof (DepositSafe) — Frontend Web Application

**DepositSafe** is a production-grade React + TypeScript application where tenants and landlords capture locked, SHA-256 timestamped room conditions at move-in and compare them at move-out to resolve rental deposit disputes with verifiable proof.

---

## ⚡ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite
- **Routing**: `react-router-dom`
- **Styling**: Vanilla CSS Design System (Tailored HSL tokens, dark mode, glassmorphism)
- **Icons**: `lucide-react`
- **HTTP Client**: `axios` with typed interceptors & mock fallback mode
- **Hashing**: Browser Native Web Crypto API (`crypto.subtle.digest('SHA-256')`)
- **Testing**: Vitest + React Testing Library + jsdom

---

## 📁 Repository Structure

```text
ghar_proof_app/
├── .agents/skills/             # Tailored frontend agent workflows
│   ├── ticket-kickoff/
│   ├── context-load/
│   ├── context-save/
│   ├── implement-from-plan/
│   ├── self-review/
│   ├── test-companion/
│   ├── regression-check/
│   ├── optimize-pass/
│   └── ship-it/
├── AGENTS.md                   # AI agent rules & conventions (CLAUDE.md symlinked)
├── docs/
│   ├── CODEBASE_CONVENTIONS.md # Frontend conventions & patterns
│   └── workspace/tickets/      # Ticket plans & decision logs
├── specs/                      # System specifications
│   ├── 01-frontend-architecture.md
│   ├── 02-ui-ux-design-system.md
│   ├── 03-screen-flows-and-pages.md
│   └── 04-api-integration-and-state.md
└── src/
    ├── api/                    # Typed API client & fallback mock services
    ├── components/
    │   ├── common/             # Navbar, Badge, HashBadge, Modal, LoadingSpinner
    │   ├── inspection/         # RoomChecklist, AddRoomItemModal, DualSignOffCard
    │   ├── comparison/         # ComparisonDiffTable
    │   └── disputes/           # SettlementCalculator, CreateDisputeModal, DisputeActionModal
    ├── context/                # AuthContext, ToastContext
    ├── hooks/                  # useAuth, useToast
    ├── pages/                  # Dashboard, Rentals, Inspection, Comparison, Disputes, Certificate
    ├── styles/                 # theme.css (HSL tokens), index.css (design system)
    ├── test/                   # Vitest unit & component test suite
    ├── types/                  # Centralized TypeScript contracts
    └── utils/                  # crypto, formatters, storage
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Cryptographic Tamper-Proofing Features

1. **Client-Side SHA-256 Hashing**:
   Photos attached to room items compute their SHA-256 digest directly in the browser via Web Crypto API before upload.
2. **Dual Sign-Off & Status Lock**:
   Move-in and move-out inspections require sign-off from both Landlord and Tenant. Once both parties agree, the inspection enters immutable `locked` status with a canonical composite `rootHash`.
3. **Condition Comparison Engine**:
   Side-by-side room condition diffing highlights unchanged vs damaged fixtures with photos and baseline notes.
4. **Interactive Settlement Calculator**:
   Computes `Original Deposit - Agreed Deductions = Net Refund Amount`.
5. **Downloadable PDF Audit Report**:
   Streams tamper-proof audit certificates matching NestJS backend reports.
