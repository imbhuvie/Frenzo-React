# FrenZo Web Project Status

This document records the frontend's delivered functionality, current gaps, and future feature work. Update the feature log when work is completed or a new feature is added.

## Project overview

FrenZo Web is a React and TypeScript single-page frontend built with Vite. It communicates with a separate FrenzoAPI backend. During local development, Vite forwards `/api` requests to the target in `vite.config.ts` (currently `https://localhost:7172`); app code uses the relative baseURL `/api` so no host/port is hardcoded.

## Completed

### Application foundation

- Set up the Vite, React 18, and TypeScript application.
- Added client-side routing for login, signup, and the protected chat route.
- Added shared authentication layout, input, button, logo, and notification components.
- Applied Tailwind CSS styling with Framer Motion transitions and Lucide icons.

### Authentication

- Added signup with username, email, phone number, and password fields.
- Added client-side required-field and format validation for signup and sign-in forms.
- Added password strength feedback on the signup form.
- Integrated signup and login requests with the backend authentication endpoints.
- Added API success and error notifications, including backend field-validation errors.
- Persisted the authenticated user, bearer token, and expiry time in local storage.
- Restored valid sessions, automatically logged out expired sessions, and protected `/chat` from unauthenticated access.
- Attached the bearer token to API requests and redirected to login when the API responds with HTTP 401.

### Chat workspace shell

- Added the authenticated chat page with the user's profile summary and sign-out action.
- Added empty-state presentation for conversations and introductory chat actions.
- Added conversation-search input and user-menu presentation.

### Live chatlist (homepage after login)

- Loads `GET /api/conversations` on entry (Bearer token via shared client, 20 per page).
- Renders rows in login/signup styling: gradient-initial avatars (or photo), name, last-message
snippet, relative time, violet unread pill (`99+` cap), mute icon, group badge, selected ring.
- Covers skeleton loading, retryable error, empty state, and client-side name search.
- Clicking a row selects it and previews its header in the main pane (thread lands in a later task).

## Current limitations

- Message history, sending, and real-time updates are not implemented or connected to an API (row click previews the header only).
- Conversation search filters the loaded page client-side; server paging continues via cursor when more pages land.
- New conversation, start conversation, create group, and settings controls are presentation-only.
- The forgot-password control is presentation-only.
- Signup directs the user to sign in; it does not automatically establish a session.
- Authentication requires the separate FrenzoAPI service. Its implementation and deployment configuration are outside this frontend repository.
- The development proxy target is currently configured directly in `vite.config.ts` (`https://localhost:7172` + `secure: false`); app code keeps the relative baseURL `/api`.
- `package.json` does not define a test or lint script. `npm run build` runs TypeScript project checks and creates the Vite production build.

## Feature log

| Date | Feature or change | Status | Notes |
| --- | --- | --- | --- |
| Initial frontend | Authentication screens, API integration, session handling, protected chat shell | Complete | See the completed sections above. |
| 2026-10-10 | Axios baseURL made relative (`/api`) so requests flow same-origin through the dev proxy (no CORS/cert issues) | Complete | `src/api/axios.ts`; proxy target is the single backend address. |
| 2026-10-10 | Proxy repointed to live API port (`https://localhost:7172` + `secure: false`) after empty-500 proved `http://localhost:5143` had no listener | Complete | `vite.config.ts`; dev server restart required (proxy loads at startup). |
| 2026-10-10 | Homepage chatlist after login: live rows (avatar, snippet, time, unread, mute), skeleton/error/empty states, search filter, select-to-preview header | Complete | `types/chat.ts`, `api/chat.ts`, `components/chat/*`, `ChatPage.tsx`; backend `GET /api/conversations`. |
| 2026-10-11 | In-flight guard stops the StrictMode double GET per `/chat` entry (backend log showed back-to-back pairs on login/refresh) | Complete | `ChatPage.tsx` `chatlistInflight` ref; single GET per entry, prod unchanged. |
| 2026-10-11 | Fixed blank login page: `navigate()` ran during render when a valid session existed; moved to `useEffect` (audited `SignupPage` — no such pattern) | Complete | `LoginPage.tsx`; stored session now bounces to `/chat` with no console warning. |

When adding an entry, use the date the change was delivered, describe the user-visible or technical change, and mark it complete only after implementation and verification.

## Planned work

- Implement message history and message sending for the selected conversation, then support real-time updates if provided by the backend.
- Implement conversation search and account settings.
- Add forgot-password and password-reset flows if supported by the API.
- Add automated tests and linting scripts as the feature surface grows.

## Local development and verification

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Run the project type checks and production build:

```bash
npm run build
```

The API-dependent signup and sign-in flows need the FrenzoAPI backend available at the proxy `target` in `vite.config.ts`. See the root [README](../README.md) for setup and API details. Companion docs: `CODE_STRUCTURE.md` (layout), `FLOW.md` (boot/auth/request/session flows), `EXECUTION.md` (run, verify, troubleshoot).
