# Theming and settings

Files: `src/global.css`, `src/lib/theme-preference.ts`, `src/lib/accent-preference.ts`, `src/lib/flags.ts`, `src/app/(settings)/*`, `src/app/(tabs)/settings.tsx`.

## Colors in code

Use semantic tokens only; they change with the theme automatically.

```tsx
<View className="bg-background">
  <Text className="text-foreground">Title</Text>
  <Text className="text-muted">Supporting text</Text>
</View>
```

Common tokens: `background`, `foreground`, `surface`, `surface-secondary`, `muted`, `accent`, `accent-foreground`, `border`, `separator`, and the status colors `success`, `warning`, `danger` (use those only for their meaning). The full list and values are in `DESIGN.md`.

When a prop needs a color value instead of a class (an icon, a gradient), read it with the hook:

```tsx
const accent = useThemeColor("accent");
<Ionicons name="add" size={20} color={accent} />;
```

## Light, dark or system

`theme-preference.ts` stores the choice on the device and applies it at startup.

```ts
import { getThemePreference, setThemePreference } from "@/lib/theme-preference";

setThemePreference("dark"); // "system" | "light" | "dark"; saved and applied immediately
```

`applyStoredThemePreference()` runs once in the root layout before the first render, so there is no flash of the wrong theme. The picker screen is `src/app/(settings)/theme.tsx`. Read the active theme in a component with `useUniwind().theme`.

## Fonts

The app uses Inter (`@expo-google-fonts/inter`). The four weights are loaded with `useFonts` in `src/app/_layout.tsx`, which also holds the splash screen until they and the stored session are ready, and mapped in `src/global.css`:

```css
@theme {
  --font-normal: "Inter_400Regular";
  --font-medium: "Inter_500Medium";
  --font-semibold: "Inter_600SemiBold";
  --font-bold: "Inter_700Bold";
}
```

To switch fonts: install the package (`bunx expo install @expo-google-fonts/<font>`), import its four weights in `_layout.tsx` and pass them to `useFonts`, then update the four names in `global.css`. Always define all four weights together; a missing one makes iOS pick the wrong face. If loading fails, the app falls back to the system font. Italic and other weights are not loaded; add them the same way if you need them.

## Accent color

`accent-preference.ts` lets the user pick the app's main color. Presets live in one object:

```ts
export const ACCENTS = {
  blue: { label: "Blue", accent: "#0485F7", foreground: "#FCFCFC" },
  indigo: { ... },
  // ...
};
```

- **Add a preset:** add an entry. `accent` is the color; `foreground` is the text/icon color on top of it (pick light text for dark accents and dark text for light accents). Use hex or `rgb()` values: React Native styles do not understand `oklch()`.
- **Use it:** change it with `setAccentPreference("indigo")`; read the selection with `useAccentPreference()`, which re-renders the component when it changes. The picker is `src/app/(settings)/accent.tsx`.
- **How it works:** it overrides HeroUI's `--accent` and `--accent-foreground` variables for both themes at runtime, so every `bg-accent`, button, focus ring and the derived hover/soft shades follow. `applyStoredAccent()` restores the saved choice at startup.
- Red, green and amber are intentionally not offered: they mean danger, success and warning.

To change the default theme colors for everyone (not user-selectable), override variables in `src/global.css`:

```css
@layer theme {
  @variant light {
    --accent: oklch(0.65 0.25 270);
  }
  @variant dark {
    --accent: oklch(0.65 0.25 270);
  }
}
```

## Adding a setting

1. **Store it.** For a simple preference, a tiny module like `theme-preference.ts`:

   ```ts
   import { readSetting, writeSetting } from "./flags";

   export function getCompactMode(): boolean {
     return readSetting("compact") === "1";
   }
   export function setCompactMode(value: boolean): void {
     writeSetting("compact", value ? "1" : "0");
   }
   ```

   `readSetting`/`writeSetting` are synchronous, so the value is ready on the first render. If other screens must react to changes, expose it with `useSyncExternalStore` as `accent-preference.ts` does.

2. **Add a row** to `src/app/(tabs)/settings.tsx`. Rows are `ListGroup.Item`s inside a `ListGroup`, with `ListGroup.ItemPrefix` (icon), `ItemContent` + `ItemTitle`, and `ItemSuffix` (chevron or value):

   ```tsx
   <ListGroup.Item onPress={() => router.push("/compact")}>
     <ListGroup.ItemPrefix>
       <Ionicons name="resize-outline" size={18} color={muted} />
     </ListGroup.ItemPrefix>
     <ListGroup.ItemContent>
       <ListGroup.ItemTitle className="font-normal">Compact mode</ListGroup.ItemTitle>
     </ListGroup.ItemContent>
     <ListGroup.ItemSuffix />
   </ListGroup.Item>
   ```

   For an on/off value, put a HeroUI `Switch` in the suffix instead of navigating.

3. **If it opens a screen**, create `src/app/(settings)/compact.tsx` (copy `theme.tsx`) and add `<Stack.Screen name="(settings)/compact" />` inside the protected group in `src/app/_layout.tsx`.

Settings that belong to the user's account rather than the device should be saved on the server through `api()` instead.

## Accessibility reminders

Keep touch targets at least 44 points, give icon-only buttons an `accessibilityLabel` (`HeaderIconButton` requires one), do not use color alone to convey state, and keep font scaling on. The header and tab bar honor the Reduce Motion setting.
