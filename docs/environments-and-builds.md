# Environments, builds and notifications

Files: `app.identity.json`, `app.config.ts`, `eas.json`, `scripts/init.mjs`, `.env.example`, `src/lib/notifications.ts`.

## Naming the app

All branding lives in `app.identity.json` (name, slug, scheme, package ids, EAS project id). `app.config.ts` and the runtime `config` read from it, so nothing is hardcoded in screens.

```bash
bun run init -- --name "My App" --package com.me.myapp
```

Optional flags: `--slug my-app`, `--scheme myapp`. Defaults: slug = kebab-case name, scheme = slug without dashes. It resets `easProjectId`, so link a new project afterwards:

```bash
bunx eas-cli init
```

Then:

1. Add the scheme (printed by `init`, for example `myapp://`) to the API's `trustedOrigins` ([auth-api-setup.md](auth-api-setup.md)).
2. Replace the icons in `assets/images` and the slides in `src/app/onboarding.tsx`.
3. Set `EXPO_PUBLIC_API_URL` (see below).

## Environment variables

Local: copy `.env.example` to `.env.local` (ignored by git) and restart Expo after changing it.

Cloud builds do not see `.env.local`. Put values in `eas.json` (`build.base.env` applies to every profile) or create EAS environment variables:

```bash
bunx eas-cli env:create --name EXPO_PUBLIC_API_URL --value "https://api.example.com" --environment production --visibility plaintext
```

`EXPO_PUBLIC_*` values end up inside the app bundle, so they are public. Adding a variable is covered in [data-and-storage.md](data-and-storage.md).

## Build profiles

`APP_ENV` is set by each profile in `eas.json` and read in `app.config.ts`:

| Profile       | Use                                    | `APP_ENV`     | Installs as                           |
| ------------- | -------------------------------------- | ------------- | ------------------------------------- |
| `development` | dev client for daily work              | `development` | "App (Dev)", id suffix `.dev`         |
| `staging`     | internal testing against a staging API | `staging`     | "App (Staging)", id suffix `.staging` |
| `preview`     | internal APK to share                  | `production`  | the real app id                       |
| `production`  | store release                          | `production`  | the real app id                       |

Development and staging install next to the real app. The URL scheme is the same for all, so the API needs only one trusted origin entry.

To point staging at a staging API, add it to that profile in `eas.json`:

```json
"staging": {
  "extends": "base",
  "env": { "APP_ENV": "staging", "EXPO_PUBLIC_API_URL": "https://staging-api.example.com" }
}
```

Read the environment in code with `config.appEnv` (`"development" | "staging" | "production"`).

Common commands:

```bash
bun run start                                              # Metro
bunx eas-cli build --platform android --profile development
bunx eas-cli build --platform android --profile preview    # shareable APK
bunx eas-cli build --platform all --profile production
```

## When to rebuild the dev client

Rebuild after adding or removing a native package or changing a plugin in `app.config.ts`. This template includes native modules such as `expo-notifications`, `expo-blur`, `expo-glass-effect` and AsyncStorage. JavaScript-only changes reload instantly.

## Push notifications

`src/lib/notifications.ts` provides two things.

**Register a device** (call it from a user action, such as enabling reminders, so the system prompt has context):

```ts
import { registerForPushNotifications } from "@/lib/notifications";

const result = await registerForPushNotifications();
if (result.status === "granted") {
  await api("/api/push-tokens", { method: "POST", body: { token: result.token } }); // your endpoint
} else if (result.status === "denied") {
  // explain how to enable notifications in system settings
}
```

`status` is `"granted"` (with `token`), `"denied"` or `"unavailable"`. It is unavailable on simulators and when the app has no EAS project id. Push needs a physical device, a linked EAS project (`bunx eas-cli init`) and a development or release build, not Expo Go. You need an API endpoint that stores the token; this template does not include one.

**Open a screen from a notification tap.** `useNotificationRouting()` is mounted in the root layout. Send a notification with a `data.url` path:

```json
{ "to": "<token>", "title": "New entry", "body": "Tap to open", "data": { "url": "/notes/42" } }
```

It works from a cold start too. Only paths starting with `/` are followed, so a crafted payload cannot open arbitrary URLs. Notifications that arrive while the app is open are shown as a banner.

## Deep links

Links of the form `<scheme>://notes/42` open the matching route with no extra code, because Expo Router maps URLs to files. Test one on a device or simulator:

```bash
bunx uri-scheme open "rntemplate://settings" --android
bunx uri-scheme open "rntemplate://settings" --ios
```

Web links (`https://example.com/notes/42` opening the app) need extra setup: an `associatedDomains` entry for iOS and `intentFilters` for Android in `app.config.ts`, plus a hosted association file on the domain.

## Checks and CI

```bash
bun run typecheck
bun run lint
bun run format:check
```

### Pre-commit hook

Husky runs `lint-staged` and then `bun run typecheck` before every commit (`.husky/pre-commit`). `lint-staged` runs ESLint (with `--fix`) and Prettier on the staged files only, so formatting is fixed for you, and the commit is blocked if lint errors remain or the project does not typecheck. The hook is installed by `bun install` (the `prepare` script). Skip it in an emergency with `git commit --no-verify` and fix the problem afterwards. The file globs are in the `lint-staged` section of `package.json`.

There is no CI workflow in this repo yet. To add one, create `.github/workflows/ci.yml` that sets up Bun, runs `bun install --frozen-lockfile`, then the three commands above.
