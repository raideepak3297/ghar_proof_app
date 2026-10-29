# API Integration & State Specification

## 1. Endpoints Mapping
- `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- `GET /rentals`, `POST /rentals`, `GET /rentals/:id`, `POST /rentals/:id/accept-invite`
- `POST /rentals/:rentalId/inspections`
- `GET /inspections/:id`
- `POST /inspections/:id/items`
- `POST /inspections/:id/items/:itemId/photos` (multipart)
- `POST /inspections/:id/sign-off`
- `GET /rentals/:id/comparison`
- `POST /rentals/:id/disputes`, `PATCH /rentals/:id/disputes/:disputeId`
- `GET /rentals/:id/report.pdf` (Blob stream download)

## 2. Token & Session Persistence
- Tokens stored in `localStorage` under `gharproof_token`.
- Current user profile stored under `gharproof_user`.
- Simulated offline mode automatically provides realistic stateful responses if backend server is unreachable.
