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

### Start-chat picker (`+` icon)

- Opens a symmetric modal listing all active users except self (server search, loading/error/empty states).
- Rows show **Open** (existing 1-1 → selects instantly, no write) or **+ Chat** (creates-or-opens via
`POST /api/conversations/direct`, then reloads the list and selects the row).
- Closes on Esc, backdrop click, or success; per-row spinner while starting; 401 handled globally.

## Current limitations

- Real-time updates flow through the hub; message history now loads (latest 30 + older), sending is live.
- Conversation search filters the loaded page client-side; server paging continues via cursor when more pages land.
- Group creation and settings controls are presentation-only (start-chat covers 1-1 only).
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
| 2026-10-11 | Start-chat via `+`: modal lists all active users (search, Open/Start states); Start creates-or-opens a Private 1-1 and selects it | Complete | `types/chat.ts`, `api/chat.ts`, `components/chat/NewChatModal.tsx`, `ChatPage.tsx`; backend `GET /api/users` + `POST /api/conversations/direct`. |
| 2026-10-11 | Fixed modal double GET (twin immediate+debounced effects) with one dynamic-delay effect + in-flight guard; added `FETCH_RULES.md` (one-effect-per-fetch) so it never recurs | Complete | `NewChatModal.tsx`; reference: `ChatPage.tsx` guard. |
| 2026-10-11 | Thread view UI-only: selecting a chat replaces welcome with empty-thread placeholder + dead textbox/Send composer (no APIs, no state, no attachments) | Complete | `components/chat/MessageComposer.tsx`, `ChatPage.tsx`; send/history wiring deferred. |
| 2026-10-11 | Thread history + read receipts: open loads latest 30 (Load older via cursor), merged with live rows, badge zeroes via `POST read` | Complete | `types/chat.ts`, `api/chat.ts`, `ChatPage.tsx`; backend history + read endpoints. |
| 2026-10-11 | Live send + receive via SignalR: hub connects on `/chat`, composer sends through it, bubbles render instantly, failures keep text + toast | Complete | `@microsoft/signalr`, `api/signalr.ts`, `hooks/useChatHub.ts`, `types/chat.ts`, `ChatPage.tsx`, `vite.config.ts` `/hubs` proxy; history still deferred. |

When adding an entry, use the date the change was delivered, describe the user-visible or technical change, and mark it complete only after implementation and verification.

## Planned work

- Implement real-time updates if provided by the backend (hub wiring on top of the live thread).
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
