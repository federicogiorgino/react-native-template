# Data and storage

Files: `src/lib/env.ts`, `config.ts`, `api.ts`, `query-client.ts`, `query-provider.tsx`, `storage.ts`, `flags.ts`.

## Configuration

| Import                     | Holds                                                      |
| -------------------------- | ---------------------------------------------------------- |
| `config` from `lib/config` | `appName`, `slug`, `version`, `scheme`, `appEnv`, `apiUrl` |
| `env` from `lib/env`       | validated build-time variables: `apiUrl`, `appEnv`         |

`env.ts` validates variables with Zod when the app starts and throws a readable error if one is missing or malformed. Add a variable in two places, and reference it as a literal `process.env.EXPO_PUBLIC_X` (Metro only inlines literal references):

```ts
const schema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
  EXPO_PUBLIC_FEATURE_X: z.string().optional(), // 1. declare it
});

const parsed = schema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_FEATURE_X: process.env.EXPO_PUBLIC_FEATURE_X, // 2. read it literally
});
```

Then expose it on the `env` object. Put the value in `.env.example`, your `.env.local`, and the EAS environment (`eas.json` `env` or `bunx eas-cli env:create`) for cloud builds. Variables are public: never put secrets in `EXPO_PUBLIC_*`.

## Calling the API: `api()`

```ts
import { z } from "zod";
import { api } from "@/lib/api";

const noteSchema = z.object({ id: z.string(), title: z.string(), body: z.string() });

const note = await api("/api/notes/42", { schema: noteSchema });
const created = await api("/api/notes", {
  method: "POST",
  body: { title: "Hi" },
  schema: noteSchema,
});
const page = await api("/api/notes", { query: { cursor, limit: 20 } });
```

Options: `method`, `query` (null/undefined values are skipped), `body` (sent as JSON), `headers`, `signal`, `timeoutMs` (default 15 s) and `schema`.

What it does for you:

- Adds the Better Auth session cookie to every request.
- Turns every failure into an `ApiError` with `status`, `code`, `message` and `details`. `status` is `0` when no response arrived (`code` is `NETWORK` or `TIMEOUT`).
- With `schema`, a response that does not match throws `INVALID_RESPONSE` instead of putting bad data in your UI.
- A `401` response ends the session, so the app returns to sign-in.
- Messages for missing, forbidden, rate-limited and server errors are already user-friendly. Show them with `getErrorMessage(error, "Fallback text")`. Use `isApiError(error)` to branch on `error.status` or `error.code`.

## Server state: React Query

The `QueryProvider` is mounted in the root layout. Write one hook per resource:

```ts
// src/features/notes/queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const noteKeys = {
  all: ["notes"] as const,
  detail: (id: string) => ["notes", id] as const,
};

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    // Pass the signal so leaving the screen cancels the request.
    queryFn: ({ signal }) => api(`/api/notes/${id}`, { signal, schema: noteSchema }),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; body: string }) =>
      api("/api/notes", { method: "POST", body: input, schema: noteSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
}
```

Use it in a screen, covering every state:

```tsx
const { data, isPending, isError, error, refetch } = useNote(id);

if (isPending) return <Skeleton className="h-24 rounded-xl" />;
if (isError) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Couldn't load"
      description={getErrorMessage(error)}
      actionLabel="Try again"
      onAction={() => void refetch()}
    />
  );
}
return <NoteView note={data} />;
```

Defaults set in `query-client.ts`:

| Behavior          | Setting                                               |
| ----------------- | ----------------------------------------------------- |
| Data is fresh for | 30 seconds                                            |
| Retries           | network errors and 5xx twice; never 4xx               |
| Offline           | requests pause and resume when the connection returns |
| Foreground        | stale queries refetch when the app becomes active     |
| Mutations         | never retried automatically                           |

### The on-device cache

Successful queries are saved to the device and restored on launch (kept for 24 hours), so lists appear instantly and work offline. The cache is dropped when the user signs out and when the app version changes.

Keep a query out of the cache (sensitive or throwaway data):

```ts
useQuery({ queryKey: [...], queryFn: ..., meta: { persist: false } });
```

Clear everything manually with `await clearQueryCache()` from `lib/query-client`.

### Lists: infinite scroll and pull-to-refresh

`LargeTitleScreen` supports both. The list renders inside the screen's scroll view, which is fine for up to a few hundred rows. Use a virtualized list for very long lists.

```tsx
import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { HEADER_BAR_HEIGHT, LargeTitleScreen } from "@/components/large-title-screen";

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const {
    data,
    isPending,
    isError,
    error,
    isRefetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notes"],
    queryFn: ({ pageParam, signal }) =>
      api("/api/notes", { query: { cursor: pageParam, limit: 20 }, signal, schema: pageSchema }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const notes = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <LargeTitleScreen
      title="Notes"
      // Fires once near the bottom; re-arms when more content arrives.
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) void fetchNextPage();
      }}
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            progressViewOffset={insets.top + HEADER_BAR_HEIGHT}
          />
        ),
      }}
    >
      {/* skeleton while isPending, EmptyState on error or when notes is empty,
          cards for notes, a spinner while isFetchingNextPage, and a Retry button
          when isFetchNextPageError */}
    </LargeTitleScreen>
  );
}
```

Pitfalls: guard `onEndReached` with `isFetchingNextPage` and `isFetchNextPageError` so a failing page does not retry in a loop, and show a Retry button for that case.

## Storing things on the device

Pick by what you are storing:

| Data                                                       | Use                                                        | Why                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Session tokens, secrets                                    | handled for you by `auth-client.ts` (SecureStore)          | encrypted keychain                            |
| Tiny settings read at startup (theme, accent, "onboarded") | `readSetting` / `writeSetting` from `lib/flags`            | synchronous, so available on the first render |
| Larger or non-secret data (drafts, cached objects)         | `readJSON` / `writeJSON` / `removeItem` from `lib/storage` | async, not encrypted                          |

```ts
import { readJSON, writeJSON } from "@/lib/storage";

await writeJSON("draft", { title, body });
const draft = await readJSON<{ title: string; body: string }>("draft"); // null when missing
```

Keys are prefixed with the app slug so two apps never collide. SecureStore values are small (about 2 KB); put anything bigger in `storage`. Neither is a database: for relational or offline-first data, add one deliberately.
