# FrenZo Web

FrenZo Web is the React and TypeScript frontend for FrenZo, a chat application. It includes account registration and sign-in flows, client-side session persistence, a protected chat homepage with a live conversation list, a start-chat user picker, and a UI-only message thread view.

## Features

- Sign up with a username, email address, phone number, and password.
- Sign in with a username, email address, or phone number.
- Client-side form validation, API error feedback, and password-strength feedback.
- Persist JWT-based authentication in browser local storage, enforce token expiry, and protect the chat route.
- Live chatlist after login: avatars, last-message previews, relative times, unread badges, mute flags, skeleton/error/empty states, search filter, select-to-preview.
- Start-chat picker (`+`): all active users with search, Open existing 1-1 instantly or Start a new one (idempotent backend).
- UI-only thread view with dead textbox/Send composer (history + sending land in later tasks).
- Responsive authentication screens and an animated chat workspace shell.
- Axios API client that attaches the saved bearer token and handles unauthorized responses.

## Requirements

- Node.js and npm.
- The FrenzoAPI backend running at the proxy `target` in `vite.config.ts` (currently `https://localhost:7172`). Vite proxies requests from `/api` to that address.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (the configured development port is `3000`). To run the production build:

```bash
npm run build
npm run preview
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build. |
| `npm run preview` | Serve the production build locally. |

## API integration

The Axios client uses `/api` as its base URL (relative — no host/port in app code). The Vite development proxy forwards these requests to the `target` in `vite.config.ts` (currently `https://localhost:7172`).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account. |
| `POST` | `/api/auth/login` | Authenticate and return user and token data. |
| `GET` | `/api/conversations` | Caller's chatlist with last-message previews (cursor paging). |
| `GET` | `/api/users` | Active users with direct-chat flags (search). |
| `POST` | `/api/conversations/direct` | Open-or-create a Private 1-1 (idempotent). |

The frontend expects API responses in the `{ success, message, data, errors }` envelope. Login data includes a user, a JWT token, and an `expiresAt` timestamp. See [the project status and feature log](docs/PROJECT_STATUS.md) for the current implementation status.

## Project structure

```text
src/
  api/                 Axios client plus auth and chat API calls
  components/          Shared route guard, layouts, UI, and chat components
  contexts/            Authentication state and session persistence
  pages/               Login, signup, and chat screens
  types/               Auth and chat request/response types
```

Docs live in `docs/`: `PROJECT_STATUS.md` (features + log), `CODE_STRUCTURE.md` (layout),
`FLOW.md` (boot/auth/chat flows), `EXECUTION.md` (run + verify), `FETCH_RULES.md` (one-effect-per-fetch).

## Current status

Authentication, live chatlist, start-chat picker, and the UI-only thread view are implemented. Message history/sending, groups, channels, and account settings still require implementation and backend integration. The frontend repository does not include the API server.
