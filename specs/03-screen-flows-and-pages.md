# Screen Flows and Pages Specification

## 1. Authentication
- `/login`: Email & password login, quick role switch demo buttons (Landlord / Tenant).
- `/register`: User registration with role selection.

## 2. Property & Rentals Dashboard
- `/dashboard`: High-level metrics (Total properties, Active inspections, Locked audits, Open disputes).
- `/rentals`: Property card list, filter by status, "New Rental Property" modal.
- `/rentals/:id`: Detail view showing rental terms, tenant info, move-in status, and move-out status.

## 3. Inspection Workflow (`/rentals/:id/inspections/:type`)
- Dynamic room checklist (Living Room, Kitchen, Bedroom, Bathroom, Balcony).
- Add item modal with condition tags (Good, Fair, Poor, Damaged) and notes.
- Photo capture & upload with live SHA-256 hash display.
- Dual Sign-off panel: Landlord agreement and Tenant agreement.
- Immutability banner and locked rootHash badge once both sign.

## 4. Comparison Engine (`/rentals/:id/comparison`)
- Move-in vs Move-out side-by-side diff table.
- Visual status badges: Unchanged, Damaged Since Move-In, Disputed.
- Direct "Raise Deduction" action button on damaged items.

## 5. Disputes & Settlement (`/rentals/:id/disputes`)
- Itemized deduction breakdown.
- Landlord deduction proposal modal (category, amount, evidence photo).
- Tenant counter-offer / dispute modal.
- Interactive settlement calculator: Deposit - Deductions = Refund.

## 6. Tamper-Proof Audit Certificate & PDF (`/rentals/:id/report`)
- Cryptographic certificate with verified SHA-256 rootHash, timestamp, signatures.
- Download official PDF audit report button.
