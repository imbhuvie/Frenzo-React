# FrenZo Web — Code Structure

React 18 + TypeScript + Vite single-page app (`frenzo-chat`). Styling: Tailwind CSS + Framer Motion + Lucide icons. HTTP: axios. Routing: react-router-dom. Notifications: react-hot-toast.

## Tree (`src/`)

```text
src/
├── main.tsx                # Entry: mounts <App/> into #root (StrictMode) + global CSS
├── App.tsx                 # Providers (AuthProvider), router, routes, global <Toaster>
├── index.css               # Tailwind + global styles
├── vite-env.d.ts           # Vite client types
├── api/
│   ├── axios.ts            # Shared instance: baseURL '/api', JSON, 15s timeout, JWT + 401 interceptors
│   └── auth.ts             # authApi: signup(data) -> UserResponse, login(data) -> AuthResponse
├── types/
│   └── auth.ts             # Mirror of backend contracts: SignupRequest, LoginRequest,
│                           # UserResponse, AuthResponse, ApiResponse<T> envelope
├── contexts/
│   └── AuthContext.tsx     # Session state: user/token, login(), logout(), restore-on-load,
│                           # expiry auto-logout (localStorage: frenzo_token/user/expires)
├── components/
│   ├── ProtectedRoute.tsx  # Redirects to /login when not authenticated (preserves `from`)
│   ├── layout/AuthLayout.tsx # Shared auth-screen shell (logo, title, card, motion)
│   └── ui/                 # Input, Button, Logo (reused by login/signup)
└── pages/
    ├── LoginPage.tsx       # Identifier + password, validation, login -> /chat
    ├── SignupPage.tsx      # Username/email/phone/password, strength meter, -> /login
    └── ChatPage.tsx        # Authenticated shell: sidebar, search, profile menu, logout
```

## Layer responsibilities

| Layer | Owns | Must not |
|-------|------|----------|
| `pages/` | Screens, form state, validation, toasts, navigation | Raw HTTP (uses `api/`) |
| `api/` | Endpoints + shared axios config/interceptors | UI state, routing |
| `types/` | Backend-matching contracts (field names mirror `FrenzoAPI.DTOs.Auth`) | Logic |
| `contexts/` | Session lifecycle (persist/restore/expire/logout) | API calls |
| `components/` | Reusable UI + route guards | Business rules |

## Key conventions

- Field names match the backend exactly (`identifier`, `phoneNumber`, `expiresAt`) — the proxy forwards JSON untouched.
- Timestamps are UTC ISO strings from the API; the client parses/displays in device locale.
- Auth token travels as `Authorization: Bearer <token>` (request interceptor); a `401` clears storage and returns to `/login`.
- Dev API address lives in exactly one place: `vite.config.ts` proxy `target` (never in `api/` code).
