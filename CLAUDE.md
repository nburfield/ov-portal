# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server (0.0.0.0:8069 with HMR)
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format src/
npm run preview      # Preview production build
npm test             # Run Vitest test suite
```

Environment: `VITE_API_BASE_URL` sets the backend API base URL (see `dev.envs`).

## Architecture

React 19 + Vite 7 SPA for a multi-tenant business operations portal (OneVizn). Tailwind CSS 4 for styling with light/dark theme support via CSS custom variables in `src/index.css`.

### State Management

React Context API only (no Redux):
- **AuthContext** — JWT auth, token refresh (5 min before expiry), localStorage persistence, auto-logout on 401
- **BusinessContext** — Active business selection, multi-business support, depends on AuthContext
- **ThemeContext** — Light/dark toggle, persisted to localStorage, pre-hydration script in `index.html` prevents flash

### API Layer (`src/services/`)

Centralized Axios instance in `api.js` with:
- Request interceptor injects JWT Bearer token
- Response interceptor handles errors (401→logout, 403→toast, 400→validationErrors, 409→conflictDetails)
- All endpoints use `/api/v2/` prefix, 30s timeout

One service file per domain (e.g., `user.service.js`, `workorder.service.js`) exporting standard CRUD: `getAll()`, `getByKey()`, `create()`, `update()`, `remove()`.

### Routing & Access Control (`src/App.jsx`)

Route guards in `src/components/layout/`:
- **PrivateRoute** — Requires authentication
- **RoleRoute** — Hierarchical role check: `super_admin > owner > manager > worker > customer`
- **AdminRoute** — `super_admin` only (for `/admin/*` routes)
- **PublicRoute** — Login/register, redirects authenticated users to dashboard

All authenticated routes render inside `AppLayout` (Header + Sidebar).

### Key Hooks

- `useApiQuery(serviceFn, params)` — Data fetching with loading/error states
- `useDataTable(...)` — TanStack React Table wrapper
- `useUnsavedChanges()` — Track form dirty state
- `useDebounce()` — Input debouncing

### Page Patterns

Pages in `src/pages/` follow consistent patterns:
- List pages use `DataTable` with sorting, filtering, pagination, bulk selection
- Detail/edit pages use `react-hook-form` with `Modal` dialogs
- Loading states use `Skeleton` components
- Feedback via `react-toastify` toasts

### UI Components (`src/components/ui/`)

Reusable component library: Card, Button, Badge, Input, Select, Modal, ConfirmDialog, SearchableSelect, SlideOver, DatePicker, Toggle, FileUpload, EmptyState, Skeleton, Tooltip, Avatar.

Charts use `recharts` via wrapper components in `src/components/charts/`.

### Utilities (`src/utils/`)

- `formatters.js` — Currency, date/time, phone, address, number formatting
- `validators.js` — Email, phone, password validation
- `export.js` — CSV and PDF export
- `cn.js` — Class name merger
- `rrule.js` — Recurrence rule utilities

### Constants (`src/constants/`)

Route paths, role definitions, and status enums.

## Code Style

- Prettier: single quotes, no semicolons, 100 char print width (`.prettierrc`)
- ESLint flat config (`eslint.config.js`)
- Fonts: Inter (primary), JetBrains Mono (monospace)
