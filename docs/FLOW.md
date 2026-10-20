# FrenZo Web — Flow

## 1. Boot (`main.tsx` → `App.tsx`)

```text
main.tsx: createRoot(#root) -> <StrictMode><App/>
App.tsx: <AuthProvider> -> <BrowserRouter> -> <Routes> + global <Toaster>
AuthProvider: loadPersistedAuth() reads frenzo_token/user/expires ->
  valid (now < expiresAt) ? restored session : cleared storage
Routes: /login, /signup (public) | /chat (inside <ProtectedRoute>) | * -> /login
```

## 2. Signup (`SignupPage.tsx`)

```text
fill form -> client validate (required, lengths, email/phone regex, password >= 6)
  -> strength meter (length, upper, digit, symbol)
  -> POST /api/auth/signup { username, email, phoneNumber, password }
  -> 200 success: toast + navigate /login (no auto session — sign in next)
  -> 400: field errors mapped onto inputs | 409: duplicate message toast
```

## 3. Login (`LoginPage.tsx` → `AuthContext`)

```text
already authenticated? -> redirect /chat
fill identifier + password -> client validate
  -> POST /api/auth/login { identifier, password }
  -> 200 + success: login(user, token, expiresAt) persists all three ->
     toast "Welcome back, <username>" -> navigate /chat
  -> 401/message: error toast (+ field errors if ApiResponse.errors present)
  -> network failure: "Unable to connect" toast
```

## 4. Authenticated requests (`api/axios.ts` → vite proxy → FrenzoAPI)

```text
axios baseURL '/api' (relative, same-origin :3000)
  -> request interceptor attaches Authorization: Bearer <frenzo_token>
  -> vite dev proxy forwards /api/* to the API target (see EXECUTION.md)
  -> FrenzoAPI: JwtBearer validates -> controller -> ApiResponse<T> envelope
  -> response interceptor: 401 + stored token? clear storage -> /login
```

## 5. Session expiry (`AuthContext.tsx`)

```text
load: expired token (now >= expiresAt) or corrupt JSON -> storage cleared, logged out
run: setTimeout(logout, expiresAt - now) while a token is held
API 401 mid-session: interceptor clears storage -> /login (server is source of truth)
logout (ChatPage menu): clear storage + state -> toast -> /login
```

## 6. Protected navigation

```text
/chat inside <ProtectedRoute>: isAuthenticated? render <ChatPage/> : <Navigate /login state={from}>
LoginPage mirrors it: authenticated visitors bounce to /chat (no dead-end form).
```

## 7. Chat shell (`ChatPage.tsx`, current scope)

Profile summary from context user, avatar initials, user menu + sign-out, conversation search
input, empty-state and presentation-only actions (new/group/settings). Message list, history,
sending, and real-time updates are planned (see `PROJECT_STATUS.md`).

## 8. Homepage chatlist (after login)

```text
enter /chat (ProtectedRoute passed) -> loadChatlist() once on mount
  -> GET /api/conversations?pageSize=20 (Bearer attached by interceptor)
  -> 200 rows: ConversationRow list (avatar/photo, name, snippet, relative time,
     unread pill, mute icon, group badge) | 200 []: styled empty state
  -> failure (network/500): error card + Retry (same request, state kept)
  -> 401: existing interceptor clears session -> /login
search input: client-side name filter over the loaded page (no refetch)
row click: selectedId set -> row ring + main-pane header preview
  (name, Group/Direct label, unread line; thread lands in a later task)
timestamps: backend UTC ISO -> device-locale relative labels ("now", "5m", "3h", "2d")
StrictMode note: dev mounts twice; a `chatlistInflight` ref skips the second call
  while one is flying, so the backend log shows one GET per entry (prod: always one).
```

## 9. Start-chat picker (`+` icon → `NewChatModal`)

```text
click + -> modal opens (fresh search, user list loads: GET /api/users?pageSize=20)
type: debounced 300ms server search (GET /api/users?search=...)
row Open (hasDirectChat): onOpened(directConversationId) -> select row + close (no write)
row + Chat: POST /api/conversations/direct { otherUserId } -> spinner on row
  -> success: onStarted(conversationId) -> reload list -> select row + close
  -> failure: spinner clears, modal stays (toast via global handler paths)
close: X, backdrop click, or Esc; 401 anywhere: existing interceptor clears session -> /login
```

## 10. Thread view (history + live, merged by id)

```text
select chat: history effect loads latest 30 (ascending, skeleton row while loading)
  -> merge with live session rows by id -> render oldest-to-newest
  -> markRead fires -> row badge zeroes
Load older messages: cursor = oldest createdAt -> prepend (fewer than 30 means done)
live ReceiveMessage / echo: append + dedupe -> preview/unread bump + re-sort + autoscroll
empty thread (no history, no session): placeholder + composer (Send enabled, dead until §11)
```

## 11. Realtime send + receive (SignalR, hub-live only)

```text
enter /chat authed -> useChatHub connects to /hubs/chat (token factory, auto-reconnect)
  -> join happens server-side per active membership; header shows status unless connected
send: composer -> hub SendMessage { conversationId, content, type 1 }
  -> echo appends instantly (deduped by id against the broadcast)
receive: ReceiveMessage -> append to that thread -> row preview/unread bump + re-sort;
  open thread zeroes its unread; box clears only on success, failure toasts and keeps text
disconnect: unmount/logout stops; reconnect resumes automatically
history: still deferred — threads hold this session's messages only
```
