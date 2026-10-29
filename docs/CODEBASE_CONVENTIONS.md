# Codebase Conventions

_Scope: GharProof (DepositSafe) Frontend Web Application_
_Runtime: Browser | Framework: React 19 + TypeScript | Bundler: Vite | Styling: Vanilla CSS Design System_

---

## 1. Project Structure & Layout

```text
src/
├── main.tsx                  # React DOM root entry, Context providers
├── App.tsx                   # BrowserRouter, top-level layout & route tree
├── api/                      # Backend HTTP Client & Service endpoints
│   ├── client.ts             # Axios instance with request/response interceptors & token injection
│   ├── auth.api.ts           # /auth endpoints (register, login, me)
│   ├── rentals.api.ts        # /rentals endpoints (crud, accept-invite)
│   ├── inspections.api.ts    # /inspections endpoints (create, items, upload, sign-off)
│   ├── comparison.api.ts     # /comparison endpoints
│   ├── disputes.api.ts       # /disputes endpoints
│   ├── reports.api.ts        # /reports endpoints (PDF streaming)
│   └── mockData.ts           # Seamless mock data fallback for standalone demos
├── context/                  # React Contexts
│   ├── AuthContext.tsx       # User state, JWT token, role (landlord/tenant), login/logout
│   └── ToastContext.tsx      # Global toast alerts (success, error, info)
├── hooks/                    # Reusable React Hooks
│   ├── useAuth.ts            # Hook to consume AuthContext
│   ├── useToast.ts           # Hook to trigger toasts
│   ├── useRentals.ts         # Hook for rentals listing and mutations
│   └── useInspection.ts      # Hook for inspection items, photos and sign-off
├── components/               # React UI Components
│   ├── common/               # Design system primitives
│   │   ├── Navbar.tsx        # Top header with logo, role badge, profile & switch role
│   │   ├── Sidebar.tsx       # Main navigation tabs
│   │   ├── Button.tsx        # Primary, secondary, danger, ghost, icon buttons
│   │   ├── Card.tsx          # Glassmorphic card container
│   │   ├── Badge.tsx         # Status chips (draft, locked, good, damaged, etc.)
│   │   ├── HashBadge.tsx     # Verifiable SHA-256 hash chip with copy & verify
│   │   ├── Modal.tsx         # Accessible overlay modal dialog
│   │   ├── Toast.tsx         # Notification toast popup
│   │   └── LoadingSpinner.tsx# Spinners and skeletons
│   ├── inspection/           # Inspection domain components
│   │   ├── RoomChecklist.tsx # Room items grouped by room
│   │   ├── AddRoomItemModal.tsx # Add checklist item modal
│   │   ├── PhotoUploader.tsx # Photo selection with instant client SHA-256 hashing
│   │   └── DualSignOffCard.tsx # Landlord & Tenant dual agreement cards
│   ├── comparison/           # Comparison domain components
│   │   └── ComparisonDiffTable.tsx # Move-in vs Move-out side-by-side diff table
│   └── disputes/             # Dispute domain components
│       ├── DisputeList.tsx   # Itemized deductions list
│       ├── CreateDisputeModal.tsx # Landlord deduction modal
│       └── SettlementCalculator.tsx # Real-time deposit refund breakdown
├── pages/                    # Route Pages
│   ├── LoginPage.tsx         # Sign in with email & password
│   ├── RegisterPage.tsx      # Create landlord or tenant account
│   ├── DashboardPage.tsx     # Summary metrics, active rentals, pending sign-offs
│   ├── RentalsPage.tsx       # Property list & create property modal
│   ├── RentalDetailPage.tsx  # Single rental overview with inspection tabs
│   ├── InspectionPage.tsx    # Interactive room checklist, photo hashing & sign-off
│   ├── ComparisonPage.tsx    # Move-in vs Move-out visual diff comparison
│   ├── DisputesPage.tsx      # Disputes and deductions resolution hub
│   ├── AuditReportPage.tsx   # Tamper-proof inspection certificate preview & PDF download
│   └── NotFoundPage.tsx      # 404 fallback page
├── styles/                   # CSS Design System
│   ├── index.css             # CSS reset, font imports, root design tokens
│   ├── theme.css             # Light and dark mode palette variables
│   └── components.css        # Shared component utility classes
├── types/                    # TypeScript Data Contracts
│   ├── index.ts              # Export all types
│   ├── auth.types.ts         # User, Role, AuthResponse, JwtPayload
│   ├── rental.types.ts       # Rental, PropertyAddress, RentalStatus
│   ├── inspection.types.ts   # Inspection, RoomItem, Photo, SignOff
│   └── dispute.types.ts      # Dispute, DeductionCategory, ComparisonResult
└── utils/                    # Helper Utilities
    ├── crypto.ts             # Web Crypto API SHA-256 digest computation
    ├── formatters.ts         # Currency (INR), date/time formatters, hash truncate
    └── storage.ts            # LocalStorage wrappers with safe JSON parsing
```

---

## 2. Design System & Styling Conventions

- **Pure Vanilla CSS**: Never use TailwindCSS or utility libraries unless requested.
- **Color Tokens**:
  - Primary Accent: Electric Indigo / Cyan (`--color-primary`, `--color-accent`)
  - Verified / Proof: Emerald green (`--color-success`, `--color-verified`)
  - Warning / Dispute: Amber / Orange (`--color-warning`)
  - Damage / Danger: Coral / Rose (`--color-danger`)
  - Dark Theme Background: Deep Slate `#0b0f19`, Surface `#111827`, Card `#1e293b`
  - Glassmorphism: `backdrop-filter: blur(12px); border: 1px solid var(--border-subtle);`
- **Typography**: Google Fonts ("Plus Jakarta Sans", "Outfit", "JetBrains Mono" for hashes).

---

## 3. State Management & API Layer

- **Axios Client**: Configured in `src/api/client.ts` with baseURL from `import.meta.env.VITE_API_BASE_URL`.
- **Automatic Token Injection**: Axios request interceptor attaches `Bearer <token>`.
- **Graceful Fallback**: If backend is unavailable or not running, the API client automatically serves rich mock data with full offline simulation so all workflows (photo upload, hashing, sign-off, comparison, disputes) can be tested smoothly.
- **Local State**: Managed with React `useState`, `useReducer`, and `useMemo`. Context is used for global auth and toast notifications.

---

## 4. Cryptographic Tamper-Proofing Conventions

- **Client Hashing**: Every photo selected for inspection checklist computes its SHA-256 hex digest using `window.crypto.subtle.digest('SHA-256', buffer)`.
- **Verifiable Display**: Hashes are displayed with monospace font and copy-to-clipboard functionality.
- **Inspection Lockout**: Once an inspection has both `landlordSigned === true` and `tenantSigned === true`, `status` is set to `'locked'`. All inputs are disabled and the composite `rootHash` is rendered in a cryptographic audit badge.
