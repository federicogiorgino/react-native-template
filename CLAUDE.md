# CLAUDE.md

@AGENTS.md
@DESIGN.md
@docs/README.md

# 1. Project Overview

RNTemplate is an Expo React Native application built with TypeScript.

Follow the existing architecture and coding conventions. Prioritize maintainability, performance, accessibility, and a consistent user experience.

Treat this file as the primary project instruction document.

# 2. Technology Stack

- Expo SDK 58
- React Native 0.88
- React 19
- TypeScript
- Expo Router
- HeroUI Native 1.x
- Uniwind
- Tailwind CSS v4
- React Native Reanimated 4
- React Native Gesture Handler
- Gorhom Bottom Sheet
- Better Auth (`better-auth`, `@better-auth/expo`)
- TanStack Query (with on-device cache persistence)
- Zod and react-hook-form
- i18next and react-i18next (English and Italian; `expo-localization`)
- Husky and lint-staged (pre-commit lint, format and typecheck)
- expo-notifications
- AsyncStorage and expo-secure-store
- Bun

Always inspect `package.json`, the lockfile, and existing configuration before assuming a dependency or API is available.

# 3. UI Development

HeroUI Native is the primary UI component library.

Rules:

- Use HeroUI Native components whenever appropriate.
- Consult the HeroUI Native skill before implementing UI.
- Use HeroUI MCP to retrieve component documentation.
- Follow the generated AGENTS.md documentation references.
- Never invent component names, props, variants, or APIs.
- Prefer composition of existing components over reinventing them.
- Use existing theme tokens and semantic colors.
- Maintain visual consistency across screens.
- Avoid unnecessary custom components when HeroUI already provides the functionality.
- Follow the installed HeroUI Native version rather than assuming APIs from another version.
- Preserve existing component behavior and accessibility features.

Before implementing a new UI component:

1. Check whether HeroUI Native already provides the required functionality.
2. Inspect the HeroUI Native skill.
3. Retrieve the relevant component documentation using MCP or the available documentation scripts.
4. Inspect existing project components for reusable patterns.
5. Implement using documented APIs.
6. Validate the implementation.

# 4. Styling

This project uses Uniwind with Tailwind CSS v4.

Rules:

- Use Uniwind conventions for styling React Native components.
- Do not use NativeWind APIs or configuration.
- Follow existing styling patterns in the project.
- Avoid arbitrary colors and spacing values.
- Prefer reusable design tokens.
- Keep light and dark theme support consistent with the existing implementation.
- Do not introduce additional styling systems.
- Avoid unnecessary inline styles when Uniwind utilities are appropriate.
- Use React Native style props when required by a component or library API.

# 5. Design System

`DESIGN.md` is the visual implementation contract for RNTemplate.

Follow its guidelines whenever creating or modifying UI.

Rules:

- Use HeroUI Native semantic theme tokens.
- Respect the existing light and dark themes.
- Never hardcode colors when semantic tokens exist.
- Follow the documented spacing, radius, typography, and elevation conventions.
- Prefer visual hierarchy through spacing, typography, and surfaces rather than unnecessary decoration.
- Maintain consistent UI patterns across the application.
- Preserve accessibility, safe areas, font scaling, and reduced-motion preferences.
- Use semantic surface colors instead of raw neutral palette classes.
- Use existing component variants before introducing custom styling.
- Keep interactive states visually consistent.
- Avoid mixing unrelated radius, spacing, and elevation systems.

When implementing or modifying UI:

1. Inspect existing screens and reusable components.
2. Consult the HeroUI Native skill.
3. Use HeroUI MCP for component APIs and documentation.
4. Follow DESIGN.md for visual decisions.
5. Follow existing project conventions.
6. Validate the implementation on relevant platforms.

Do not create a new design language for individual screens.

# 6. Navigation

This project uses Expo Router.

Rules:

- Follow Expo Router file-based routing conventions.
- Keep navigation logic consistent with the existing structure.
- Use typed routes where supported by the project.
- Avoid introducing alternative navigation libraries.
- Preserve existing navigation behavior.
- Respect the existing route and layout organization.

# 7. React Native Development

- Write TypeScript throughout the application.
- Prefer functional components and React hooks.
- Keep components focused and reusable.
- Avoid unnecessary re-renders.
- Use React Native APIs rather than browser APIs.
- Respect safe areas and different screen sizes.
- Handle loading, error, empty, and success states.
- Consider accessibility in interactive components.
- Avoid unnecessary dependencies.
- Use appropriate TypeScript types instead of `any`.
- Clean up subscriptions, listeners, and effects when necessary.

# 8. Animations and Gestures

- Use React Native Reanimated for animations.
- Use React Native Gesture Handler for gesture interactions.
- Use Gorhom Bottom Sheet for bottom sheet functionality when appropriate.
- Follow existing integration patterns.
- Avoid introducing competing animation or gesture libraries.
- Respect device reduced-motion preferences.
- Prefer built-in HeroUI Native animation APIs when available.
- Avoid overriding animated component properties with conflicting styles.

# 9. Project Conventions

Before creating new files:

1. Inspect the existing folder structure.
2. Look for reusable components and hooks.
3. Follow existing naming conventions.
4. Avoid unnecessary abstractions.
5. Keep business logic separate from presentation where appropriate.
6. Follow existing import conventions.
7. Check whether an existing utility or module already solves the problem.

Do not reorganize the project without a good reason.

Do not introduce new architectural patterns without first understanding the existing architecture.

# 10. Package Management

Use Bun for all package management.

Examples:

- Install: `bun add package-name`
- Development dependency: `bun add -d package-name`
- Remove: `bun remove package-name`
- Run scripts: `bun run script-name`
- Execute packages: `bunx package-name`

Rules:

- Never mix npm, yarn, and Bun unnecessarily.
- Do not modify dependencies without a reason.
- Check compatibility with the existing Expo SDK and React Native versions before installing packages.
- Prefer existing dependencies over introducing alternatives.
- Preserve the existing lockfile.

# 11. UI Development Workflow

When asked to implement a new screen, feature, or UI modification, follow this workflow.

## Step 1: Understand

- Read the relevant requirements.
- Inspect the existing implementation.
- Identify affected screens, routes, components, and hooks.
- Understand the existing data flow and state management.
- Identify reusable components.

Do not start coding before understanding the relevant parts of the project.

## Step 2: Research

- Consult the HeroUI Native skill.
- Use HeroUI MCP to retrieve relevant component documentation.
- Inspect existing project patterns.
- Consult DESIGN.md for visual guidelines.
- Verify APIs against the installed package when necessary.

Never guess component APIs.

## Step 3: Plan

Before significant implementation:

- Identify which existing components can be reused.
- Identify which new components are genuinely necessary.
- Consider loading, error, empty, and success states.
- Consider navigation and interaction behavior.
- Consider accessibility and responsive layouts.
- Avoid unnecessary architectural changes.

For small and straightforward changes, keep planning lightweight.

For larger features, explain the proposed implementation before making significant architectural changes.

## Step 4: Implement

- Follow the existing architecture.
- Use HeroUI Native components wherever appropriate.
- Follow DESIGN.md consistently.
- Use semantic theme tokens.
- Keep components focused and maintainable.
- Use proper TypeScript types.
- Preserve existing functionality.
- Avoid unnecessary dependencies and abstractions.

## Step 5: Validate

After implementation:

- Run the relevant TypeScript checks.
- Run linting when relevant.
- Verify imports and component APIs.
- Check for unused imports and dead code.
- Verify navigation and interaction behavior.
- Check light and dark theme compatibility.
- Consider both iOS and Android behavior.

## Step 6: Report

After completing the work:

- Summarize what changed.
- Identify important files modified or created.
- Report validation commands and their results.
- Mention any unresolved issues.
- Never claim something works without validating it.

# 12. Documentation and Source of Truth

Use the following sources when implementing features.

## Project instructions

- `CLAUDE.md`: Project architecture, conventions, and development workflow.
- `AGENTS.md`: Generated project documentation and references.
- `DESIGN.md`: Visual design contract.
- HeroUI Native skill: Component implementation knowledge and best practices.

## Component documentation

- HeroUI Native MCP: Component documentation and API reference.
- HeroUI Native documentation scripts: Detailed component and theme documentation.
- Installed package: Actual available APIs and TypeScript definitions.

## Priority rules

When information conflicts:

1. The installed dependencies and their actual TypeScript definitions determine which APIs are available.
2. The installed HeroUI Native version determines actual component behavior.
3. Official HeroUI Native documentation provides implementation guidance.
4. The HeroUI Native skill provides implementation patterns.
5. DESIGN.md defines visual conventions.
6. CLAUDE.md and AGENTS.md define project-specific conventions.

Never assume documentation describes APIs that exist in the installed package.

When documentation conflicts with the installed version, verify against the actual package before implementing.

# 13. Validation

After implementing changes:

- Run `bun run typecheck`.
- Run `bun run lint` when relevant.
- Check for TypeScript errors.
- Verify imports and component APIs.
- Avoid leaving unused imports or dead code.
- Validate affected functionality when possible.
- Check for regressions in existing functionality.

If a validation command does not exist in package.json, do not assume it exists or claim it was executed.

Do not hide or ignore errors to make validation appear successful.

# 14. Important Rules

- Never assume a dependency is installed.
- Never invent HeroUI component APIs.
- Never use web-only React components.
- Never replace existing functionality unnecessarily.
- Never make large architectural changes without discussing them first.
- Prefer simple, maintainable solutions over unnecessary complexity.
- Ask questions when requirements are genuinely unclear.
- Inspect before modifying.
- Reuse before creating.
- Verify before assuming.
- Validate before claiming completion.

# 15. General Development Principles

Prioritize the following principles throughout the project:

1. Maintainability over unnecessary abstraction.
2. Consistency over isolated implementation choices.
3. Reuse over duplication.
4. Accessibility as a fundamental requirement.
5. Performance without premature optimization.
6. Documented APIs over assumptions.
7. Existing architecture over unnecessary rewrites.
8. Clear and predictable user experiences.

The objective is to build a reliable, maintainable, accessible, and visually consistent React Native application.

# 16. Project Foundations

The app already has shared infrastructure. Use it instead of writing your own. Detailed guides are in `docs/` (index imported above); read the matching guide before working in that area.

| Task | Use | Do not |
| --- | --- | --- |
| Screen with a header | `LargeTitleScreen` (`src/components/large-title-screen.tsx`) | build a custom header or use Expo Router's native header |
| Call the API | `api()` from `src/lib/api.ts` | call `fetch` directly |
| Server data, caching, lists | TanStack Query hooks; `useInfiniteQuery` with `onEndReached` for lists | store fetched data in `useState` or `useEffect` |
| Read config | `config` (`src/lib/config.ts`), `env` (`src/lib/env.ts`) | read `process.env` or hardcode names, URLs or ids |
| Add an env variable | declare it in `src/lib/env.ts` and `.env.example` | use it without validation (secrets never go in `EXPO_PUBLIC_*`) |
| Forms | Zod schema built from `t` (`createSchema(t)`) + `zodResolver` + `FormTextField`; shared rules in `src/lib/schemas.ts` | write inline validation rules |
| Any user-visible text | `t("group.key")` from `useTranslation()`; keys in `src/lib/i18n/en.ts` and every other language file (`docs/i18n.md`) | hardcode strings in components, labels or `accessibilityLabel`s |
| Success or failure message | `useNotify()` | `Alert.alert` |
| Ask before a destructive action | `useConfirm()` | `Alert.alert` |
| Empty, error, offline states | `EmptyState`, `ErrorScreen`, `OfflineBanner` | build one-off versions |
| Small device settings | `readSetting` / `writeSetting` (`src/lib/flags.ts`) | use AsyncStorage for values needed on first render |
| Larger non-secret data | `readJSON` / `writeJSON` (`src/lib/storage.ts`) | store secrets there |
| Theme and accent | `theme-preference.ts`, `accent-preference.ts`, semantic tokens | hardcode colors (accent presets use hex because React Native styles do not accept `oklch()`) |
| Sign-in state | `useAuthGate()` and `authClient` (backend setup: `docs/auth-api-setup.md`) | navigate manually after sign-in or sign-out |

Rules:

- A pushed screen (outside `(tabs)`) must be registered in `src/app/_layout.tsx` inside the signed-in `Stack.Protected` group. A new tab goes in `ITEMS` in `src/app/(tabs)/_layout.tsx`.
- Mark non-persistent or sensitive queries with `meta: { persist: false }`. The query cache is cleared on sign-out.
- Keep status colors (`success`, `warning`, `danger`) for their meaning only.
- Native modules need a new dev client build. Say so when adding one.
- Update the matching guide in `docs/` when you change behavior it describes.

First run in a fresh clone: `bun install`, copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL`, then `bun run start`. To rebrand the app, use `bun run init` (see `docs/environments-and-builds.md`).
