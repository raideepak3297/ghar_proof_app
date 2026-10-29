# Frontend Architecture Specification

## 1. System Overview
GharProof (DepositSafe) Frontend is a single-page application built using React 19, TypeScript, and Vite. It interfaces with the GharProof NestJS backend to provide an auditable, cryptographic deposit dispute resolution workflow for both landlords and tenants.

## 2. Layered Architecture
1. **Presentation Layer (`src/pages`, `src/components`)**:
   - Atomic design primitives in `src/components/common`
   - Domain-specific widgets in `src/components/{inspection,comparison,disputes}`
   - Route containers in `src/pages`
2. **State & Orchestration Layer (`src/context`, `src/hooks`)**:
   - `AuthContext`: Manages authenticated user state, JWT tokens, and user role.
   - `ToastContext`: Global notification messaging.
   - Custom hooks encapsulate complex domain logic.
3. **Data Access Layer (`src/api`)**:
   - Typed service clients.
   - Axios instance with JWT interceptor and error standardizer.
   - Offline fallback provider for instantaneous testing.
4. **Security & Cryptography Layer (`src/utils/crypto.ts`)**:
   - In-browser SHA-256 calculation using `crypto.subtle.digest`.
   - Client-side canonical serialization for hash verification.
