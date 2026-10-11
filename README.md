# FrenZo Web

FrenZo Web is the React and TypeScript frontend for FrenZo, a chat application. It currently includes account registration and sign-in flows, client-side session persistence, and a protected chat workspace shell.

## Features

- Sign up with a username, email address, phone number, and password.
- Sign in with a username, email address, or phone number.
- Client-side form validation, API error feedback, and password-strength feedback.
- Persist JWT-based authentication in browser local storage, enforce token expiry, and protect the chat route.
- Responsive authentication screens and an animated chat workspace shell.
- Axios API client that attaches the saved bearer token and handles unauthorized responses.

The chat workspace is currently a UI shell. Conversation search, new chat, group creation, settings, and messaging controls are not connected to chat functionality yet.

## Requirements

- Node.js and npm.
- The FrenzoAPI backend running at `http://localhost:5143` for signup and login. Vite proxies requests from `/api` to that address.

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

The Axios client uses `/api` as its base URL. The Vite development proxy forwards these requests to `http://localhost:5143`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account. |
| `POST` | `/api/auth/login` | Authenticate and return user and token data. |

The frontend expects API responses in the `{ success, message, data, errors }` envelope. Login data includes a user, a JWT token, and an `expiresAt` timestamp. See [the project status and feature log](docs/PROJECT_STATUS.md) for the current implementation status.

## Project structure

```text
src/
  api/                 Axios client and authentication API calls
  components/          Shared route guard, layouts, and UI components
  contexts/            Authentication state and session persistence
  pages/               Login, signup, and chat screens
  types/               Authentication request and response types
```

## Current status

Authentication and the initial chat workspace shell are implemented. Live messaging, conversation persistence, groups, channels, and account settings still require implementation and backend integration. The frontend repository does not include the API server.
