# FrenZo Web — Fetch Rules (never duplicate requests)

One effect owns each fetch. Two effects fetching the same data (e.g. an immediate load plus a
debounced twin) double every open — this exact bug shipped once in `NewChatModal` and was fixed
2026-10-11. Follow this shape for every new list fetch (message history, global search, ...).
Persistent connections (`useChatHub`) are exempt — they are not fetches — but keep the same
cleanup discipline (disconnect on unmount, latest-handler refs).

## The pattern

```tsx
const inflight = useRef(false);   // StrictMode double-invoke guard
const firstLoad = useRef(true);   // immediate first load, debounced typing

const load = useCallback(async (needle: string) => {
  if (inflight.current) return;   // a request is already flying — skip
  inflight.current = true;
  setLoading(true);
  try {
    /* exactly one api call here */
  } finally {
    inflight.current = false;     // always release, so Retry keeps working
    setLoading(false);
  }
}, []);

// Reset on open (no fetching here).
useEffect(() => {
  if (!open) return;
  setSearch('');
  firstLoad.current = true;
}, [open]);

// THE fetch effect — the only one allowed to call load().
useEffect(() => {
  if (!open) return;
  const delay = firstLoad.current ? 0 : 300;
  firstLoad.current = false;
  const timer = setTimeout(() => { void load(search); }, delay);
  return () => clearTimeout(timer);   // typing restarts the clock; unmount cancels
}, [open, search, load]);
```

## Checklist for new fetches

1. Exactly one effect calls the loader — grep the file for `void load` before review.
2. In-flight ref guard with release in `finally` (Retry must survive).
3. Timer cleanup returned (typing cancels, unmount cancels).
4. No fetch inside render, no fetch in a second "initial" effect.
5. Reference implementations: `ChatPage.tsx` (`chatlistInflight`), `NewChatModal.tsx` (`usersInflight`).
