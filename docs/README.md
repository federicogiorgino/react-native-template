# Documentation

Guides for the building blocks in this template. Start with the one that matches what you are doing.

| I want to...                                                                   | Read                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Add a screen with the large-title header, or change the tab bar                | [header-and-tab-bar.md](header-and-tab-bar.md)           |
| Fetch data, cache it, store things on the device, build a list                 | [data-and-storage.md](data-and-storage.md)               |
| Build a form, show a toast, ask for confirmation, show empty/error states      | [forms-and-feedback.md](forms-and-feedback.md)           |
| Translate the app, add a language, write translatable strings                  | [i18n.md](i18n.md)                                       |
| Change light/dark mode or the accent color, add a setting                      | [theming-and-settings.md](theming-and-settings.md)       |
| Set up the backend the app signs in with (Better Auth server, trusted origins) | [auth-api-setup.md](auth-api-setup.md)                   |
| Gate screens behind sign-in, change onboarding, handle sessions                | [auth-and-navigation.md](auth-and-navigation.md)         |
| Rename the app, add environments, build, send push notifications, deep link    | [environments-and-builds.md](environments-and-builds.md) |

## Where things live

```
src/app            routes (Expo Router). (tabs) is the signed-in app; sign-in and onboarding are outside it
src/components     header, tab bar, forms, dialogs, empty/error/offline states
src/lib            everything non-visual: api, queries, storage, env, auth, theme, notifications
docs               these guides
```

Rules of thumb:

- Use HeroUI Native components and semantic tokens (`bg-background`, `text-muted`, `bg-accent`); see `DESIGN.md`.
- Read configuration from `config` (`src/lib/config.ts`) and `env` (`src/lib/env.ts`), never from `process.env` or hardcoded strings.
- Talk to the server through `api()` and React Query, not raw `fetch`.
- Validate forms with Zod, report outcomes with `useNotify`, ask with `useConfirm`.

## Checks before you commit

```bash
bun run typecheck
bun run lint
bun run format:check
```

## Starting a real feature: a checklist

1. Add the route file in `src/app` (inside `(tabs)` for a tab, at the top level for a pushed screen) and register a pushed screen in `src/app/_layout.tsx`.
2. Wrap the screen in `LargeTitleScreen`.
3. Write the query hook next to the screen, with a Zod schema for the response ([data-and-storage.md](data-and-storage.md)).
4. Cover the loading, empty and error states with `Skeleton`, `EmptyState` and a retry.
5. Report results with `useNotify`; confirm destructive actions with `useConfirm`.
