# Auth and navigation

Files: `src/lib/auth-client.ts`, `src/lib/auth-gate.tsx`, `src/app/_layout.tsx`, `src/app/sign-in.tsx`, `src/app/onboarding.tsx`, `src/app/(tabs)/_layout.tsx`.

## How the app decides what to show

The root layout (`src/app/_layout.tsx`) wraps everything in providers, in this order:

```
GestureHandlerRootView
└─ HeroUINativeProvider      theme, toasts, portals
   └─ QueryProvider          React Query + on-device cache
      └─ AuthGateProvider    session + onboarding state
         └─ ConfirmProvider  useConfirm()
            └─ RootStack     the navigator
```

`RootStack` uses `Stack.Protected` groups driven by `useAuthGate()`:

| Condition                 | Screens available                                             |
| ------------------------- | ------------------------------------------------------------- |
| signed in                 | `(tabs)`, `change-password`, `delete-account`, `(settings)/*` |
| signed out, not onboarded | `onboarding`                                                  |
| signed out, onboarded     | `sign-in`                                                     |

While the stored session is being read (`status === "loading"`) the root shows only the theme background, so there is no flash of the sign-in screen. Expo Router redirects automatically when the condition changes: signing in swaps to the tabs, signing out swaps to sign-in. You never navigate manually after auth.

## `useAuthGate()`

```tsx
const { status, hasOnboarded, completeOnboarding, signOut } = useAuthGate();

const { error } = await signOut(); // error is a message string or null
```

`status` is `"loading" | "signedIn" | "signedOut"`. `signOut()` never throws; it returns `{ error }`.

To get the current user:

```tsx
const { data: session } = authClient.useSession();
session?.user.name; // also id, email
```

`authClient` (`lib/auth-client.ts`) is the Better Auth client. Other calls you can use: `authClient.signIn.email`, `signUp.email`, `signOut`, `changePassword`, `deleteUser`. The session cookie is stored in the device keychain.

## What happens on sign-out and 401

- Sign-out clears the cached query data so the next user never sees the previous user's data.
- If any `api()` call returns `401`, the session is ended and the app returns to sign-in.

## Adding screens

**A new tab:** create `src/app/(tabs)/<name>.tsx`, add an entry to `ITEMS` in `src/app/(tabs)/_layout.tsx`. See [header-and-tab-bar.md](header-and-tab-bar.md).

**A pushed screen** (opens on top of the tabs):

1. Create `src/app/<name>.tsx` and wrap it in `LargeTitleScreen`. A back button appears automatically.
2. Register it inside the signed-in `Stack.Protected` group in `_layout.tsx`:

   ```tsx
   <Stack.Screen name="<name>" />
   ```

3. Navigate with Expo Router (routes are typed):

   ```tsx
   const router = useRouter();
   router.push("/<name>");
   router.push({ pathname: "/notes/[id]", params: { id: "42" } });
   router.back();
   ```

**A route with a parameter:** `src/app/notes/[id].tsx`, then read it with `useLocalSearchParams<{ id: string }>()`.

**A modal:** register it with `<Stack.Screen name="compose" options={{ presentation: "modal" }} />`. Use `LargeTitleScreen`'s `showBackButton` to show a back button, or put your own close button in `rightContent`.

Typed routes are generated when Expo starts, so start Expo once after adding a file if `typecheck` does not know the new route.

## Sign-in and sign-up

`sign-in.tsx` is one screen with a mode toggle. Validation uses Zod (`signInSchema` / `signUpSchema` at the top of the file). Sign-up enforces `MIN_PASSWORD_LENGTH` (10, from `lib/schemas`); sign-in only requires a password, so older accounts still work. Server errors appear in an `Alert` above the form, and a duplicate email is shown on the email field.

The backend must be set up for the app, including trusting its URL scheme, or sign-in is rejected. See [auth-api-setup.md](auth-api-setup.md).

## Onboarding

`onboarding.tsx` shows swipeable slides once. Edit the `SLIDES` array (icon, title, description; keep it to a few). Finishing or skipping calls `completeOnboarding()`, which saves the flag on the device. To show it again during development, clear the app data or remove the `<slug>.onboarded` entry.

## Account screens

`(settings)/account.tsx` (profile, sign out), `change-password.tsx` (revokes other sessions), `delete-account.tsx` (asks for the password and confirms before deleting). They are reachable from the Settings tab.

## Not included

Forgot-password, email verification and social sign-in are not built. They need support on the API side first (a mail provider for the first two); Better Auth has client methods for each once the server is ready.
