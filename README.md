# App template

An [Expo](https://expo.dev) app shell with sign-in, onboarding, a settings screen and a glass tab bar, built on
[HeroUI Native](https://heroui.com/docs/native), [Uniwind](https://docs.uniwind.dev) (Tailwind CSS for React Native)
and Expo Router. It talks to a Better Auth backend (you provide the API; see "Use it for a new app").

## What's included

- **Auth:** email and password sign-in and sign-up with react-hook-form validation, session kept in the device
  keychain, route gating (`Stack.Protected`), sign out, change password and delete account.
- **Onboarding:** short first-launch slides (`src/app/onboarding.tsx`), shown once.
- **Shell:** glass tab bar, large-title screens with collapsing header, light/dark/system theme saved on the
  device, offline pill, empty state, root error boundary and a not-found screen.
- **Data:** typed API client, React Query with an on-device cache, validated environment variables and device
  storage helpers.
- **Forms and feedback:** Zod validation, toasts (`useNotify`), confirm dialogs (`useConfirm`).
- **Settings:** theme (light/dark/system), accent color and language pickers.
- **i18n:** English and Italian, with typed translation keys that follow the device language.
- **Pre-commit checks:** lint, format and typecheck run before every commit (Husky and lint-staged).
- **Notifications:** push token registration and opening a screen from a notification tap.
- **Config:** one identity file (`app.identity.json`) drives the app name, URL scheme and package ids.
- **EAS profiles:** `development` (dev client, installs next to the real app), `staging`, `preview` (APK) and
  `production` (app bundle).

How to use all of it is in [`docs/`](docs/README.md).

## Use it for a new app

```bash
bun install
bun run init -- --name "My App" --package com.me.myapp   # rewrites app.identity.json
cp .env.example .env.local                               # set EXPO_PUBLIC_API_URL
bunx eas-cli init                                        # link a new EAS project
bun run start
```

Then:

1. Set up the auth API and add the new scheme (printed by `init`, for example `myapp://`) to its trusted origins.
   Without it, sign-in is rejected. See [`docs/auth-api-setup.md`](docs/auth-api-setup.md).
2. Put the API URL in `eas.json` (`build.base.env`). EAS only uploads files git tracks, so `.env.local` is not used
   by cloud builds.
3. Replace the icons and splash image in `assets/images`, and edit the slides in `src/app/onboarding.tsx`.

## Project layout

```
app.identity.json   name, slug, scheme, package ids (edit via `bun run init`)
app.config.ts       Expo config built from the identity file
eas.json            build profiles
src/app             routes: (tabs) is the signed-in app, sign-in, onboarding, change-password, ...
src/components      glass-tabs, large-title-screen, form-text-field, empty-state, offline-banner, error-screen
src/lib             api, query-client, storage, env, config, auth, theme and accent preferences, notifications
```

Conventions: HeroUI components and semantic theme tokens (see `DESIGN.md`), forms through `FormTextField`,
nothing app-specific hardcoded outside `app.identity.json`.

## Scripts

| Command                      | What                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `bun run start`              | Start Metro (use Expo Go or a dev build)                                            |
| `bun run typecheck`          | `tsc --noEmit`. Typed routes are generated when Expo starts, so start it once first |
| `bun run lint`               | ESLint                                                                              |
| `bun run init -- --name ...` | Rename the app                                                                      |

## Build an APK

```bash
bunx eas-cli build --platform android --profile preview
```

## Not included yet

- Forgot-password and email-verification screens. They need a mail provider on the API first.
- Local database and sync client for the API's push/pull endpoints.
- Tests and CI.
