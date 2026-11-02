# Header and tab bar guide

App screens are built from two components:

- **`LargeTitleScreen`** ([`src/components/large-title-screen.tsx`](../src/components/large-title-screen.tsx)): a scrolling screen with an iOS-style large title that collapses into a blurred compact bar, optional hero artwork, action buttons and an automatic back button.
- **`GlassTabBar`** ([`src/components/glass-tabs.tsx`](../src/components/glass-tabs.tsx)): a floating glass tab bar for Expo Router's headless tabs that shrinks while you scroll, with a sliding highlight, finger scrubbing and an optional round action button.

They work on their own, and cooperate automatically when a `LargeTitleScreen` is rendered inside the glass tabs.

---

## How they work together

```
(tabs)/_layout.tsx
└─ TabBarMinimizeProvider          ← shared "minimized" progress (0 = expanded, 1 = minimized)
   └─ Tabs
      ├─ BlurTargetView            ← what Android blurs behind the tab bar
      │  └─ TabSlot → screen → LargeTitleScreen
      │        ├─ useMinimizeOnScroll()   scrolling down minimizes the bar
      │        └─ useGlassTabBarInset()   bottom padding so content clears the bar
      └─ TabList asChild → GlassTabBar
```

- **Inside the tabs**, `LargeTitleScreen` forwards its scroll events to the tab bar (scroll down → minimize, scroll up or near the top → expand) and pads its content so the last item can scroll clear of the bar.
- **Outside the tabs** (screens pushed on the root `Stack`, such as `change-password`), both hooks are no-ops: no extra bottom padding, no wasted scroll work. Nothing needs configuring.

---

## LargeTitleScreen

### Basic usage

```tsx
import { LargeTitleScreen } from "@/components/large-title-screen";

export default function ActivityScreen() {
  return (
    <LargeTitleScreen title="Activity" subtitle="Your last 30 days">
      <View className="px-4">{/* content */}</View>
    </LargeTitleScreen>
  );
}
```

`LargeTitleScreen` owns the `ScrollView`; pass your content as `children`. It hides nothing about navigation: the root stack already sets `headerShown: false`.

### Props

| Prop              | Type                                             | Description                                                                                                                                                  |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`           | `string`                                         | Large title, and the compact title once collapsed. **Required.**                                                                                             |
| `eyebrow`         | `string`                                         | Small uppercase line above the title, e.g. `"10 entries · 3 reviews"`.                                                                                       |
| `subtitle`        | `string`                                         | Muted line below the title (up to two lines).                                                                                                                |
| `hero`            | `ReactNode`                                      | Full-bleed content above the title. Starts under the status bar; the buttons float over it.                                                                  |
| `leftContent`     | `ReactNode`                                      | Rendered after the automatic back button.                                                                                                                    |
| `rightContent`    | `ReactNode`                                      | Trailing actions. Use `HeaderIconButton` to match the back button.                                                                                           |
| `showBackButton`  | `boolean`                                        | Overrides the automatic back button.                                                                                                                         |
| `scrollViewProps` | `ScrollViewProps` (minus `children`, `onScroll`) | Passed to the inner `Animated.ScrollView` (e.g. `refreshControl`, `keyboardShouldPersistTaps`). Top/bottom padding of `contentContainerStyle` is overridden. |
| `children`        | `ReactNode`                                      | Screen content. **Required.**                                                                                                                                |

### Action buttons

`HeaderIconButton` is a round HeroUI `Button` (`isIconOnly`, `tertiary`) with an accent-coloured Ionicon.

```tsx
import { HeaderIconButton, LargeTitleScreen } from "@/components/large-title-screen";

<LargeTitleScreen
  title="Journal"
  eyebrow="10 entries · 3 reviews"
  rightContent={
    <>
      <HeaderIconButton icon="star-outline" label="Favourites" onPress={openFavourites} />
      <HeaderIconButton icon="create-outline" label="New entry" onPress={openComposer} />
    </>
  }
>
  {/* … */}
</LargeTitleScreen>;
```

- `label` is the accessibility label. Always pass one.
- Slots space buttons 8pt apart. The compact title is inset so it never runs under the wider slot.

### Hero section

```tsx
function Hero() {
  const accent = useThemeColor("accent");
  const background = useThemeColor("background");
  return (
    <View
      className="h-80 justify-end px-5 pb-2"
      style={{
        experimental_backgroundImage: `linear-gradient(to bottom, ${accent} 0%, ${background} 100%)`,
      }}
    >
      {/* cover art, image, illustration... */}
    </View>
  );
}

<LargeTitleScreen
  title="Ashen Spire"
  eyebrow="Moonlit Studio"
  subtitle="Mar 14, 2025 · RPG, Action"
  hero={<Hero />}
  rightContent={<HeaderIconButton icon="share-outline" label="Share" onPress={share} />}
>
  {/* content */}
</LargeTitleScreen>;
```

- With a hero, content starts at the very top of the screen (no top padding), so the hero sits behind the status bar and buttons.
- The title block sits below the hero, left-aligned.
- Fade the hero into `background` at its bottom edge (as the gradient above does) so it blends with the content.
- Hero decoration should be hidden from screen readers (`accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`); keep meaningful images labelled.

### Back button

The back button appears automatically when the nearest enclosing **stack** can go back, and pops that same stack. Tab history is skipped on purpose, so a tab root never shows a back button even after switching tabs. Pass `showBackButton` to force it on or off.

### How the collapse works

1. On every scroll frame, the internal `CollapsingTitle` measures where the large title is on screen.
2. As it approaches the bar it fades out and lifts 12pt. That gives a 0→1 collapse progress (`compact`).
3. `compact` drives the compact title (fades and rises in) and the header blur (fades in).
4. Crossing 50% swaps which title screen readers see, so VoiceOver and TalkBack only read the visible one.

With **Reduce Motion** on, the titles switch instantly instead of fading.

When there is an eyebrow or subtitle, the title starts fading earlier so the supporting text clears the bar first (`FADE_RANGES`).

### The header blur

- **iOS:** an `expo-blur` `BlurView` (`light` / `dark` tint following the app theme), with a 40% wash of the theme background on top.
- **Android 12+:** real blur via `BlurTargetView` + `blurMethod="dimezisBlurViewSdk31Plus"`. Older Android shows the translucent wash only.
- The blur is invisible while the large title is showing and fades in as it collapses.

### Tuning

All in `large-title-screen.tsx`:

| Constant / class               | Default                                | Effect                                                                      |
| ------------------------------ | -------------------------------------- | --------------------------------------------------------------------------- |
| `BAR_HEIGHT`                   | `56`                                   | Compact bar height below the status bar; space around the buttons.          |
| `BLUR_INTENSITY`               | `60`                                   | Blur strength (expo-blur scale 1–100).                                      |
| `opacity-40` (in `HeaderBlur`) | 40%                                    | How solid the bar is. Lower = more see-through.                             |
| `FADE_RANGES`                  | `plain [36, 8]`, `supporting [20, -8]` | Where the large title starts / finishes fading, in pt below the status bar. |
| `BOTTOM_PADDING`               | `32`                                   | Space under the last item (added to the tab bar inset).                     |

---

## GlassTabBar

### Setup

The bar is used with Expo Router's headless tabs (`expo-router/ui`). The full setup lives in [`src/app/(tabs)/_layout.tsx`](<../src/app/(tabs)/_layout.tsx>):

```tsx
const blurTarget = useRef<ComponentRef<typeof View>>(null);

<TabBarMinimizeProvider>
  <Tabs>
    <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1, backgroundColor: background }} renderFn={renderFadingTabScreen} />
    </BlurTargetView>
    <TabList asChild>
      <GlassTabBar
        onIndexSelected={(i) => router.navigate(ITEMS[i].href as never)}
        blurTarget={blurTarget}
        action={{
          label: "New entry",
          renderIcon: ({ size }) => <Ionicons name="add" size={size} color={accent} />,
          onPress: openComposer,
        }}
        theme={{/* see Theme */}}
        haptics
      >
        {ITEMS.map(({ href, ...item }, index) => (
          <TabTrigger key={item.name} name={item.name} href={href as never} asChild>
            <GlassTabButton item={item} index={index} />
          </TabTrigger>
        ))}
      </GlassTabBar>
    </TabList>
  </Tabs>
</TabBarMinimizeProvider>;
```

Requirements:

- `GlassTabBar` must be inside `TabBarMinimizeProvider` (it throws otherwise).
- Every child of `GlassTabBar` is counted as a tab. Don't put anything else there; use `action` for the extra button.
- `onIndexSelected` is how taps and scrubs navigate. The index matches the order of the children.

### Adding a tab

Add an entry to `ITEMS` in the layout and create the matching route file in `src/app/(tabs)/`:

```tsx
{
  name: "library",            // route name (file name)
  href: "/library",
  label: "Library",
  renderIcon: ({ tint }) => <Ionicons name="library" size={21} color={tint} />,
}
```

`GlassTabItem` also accepts `icon` (an SF Symbol name via `expo-symbols`) instead of `renderIcon`, but SF Symbols are iOS-only. Prefer `renderIcon` with Ionicons. `renderIcon` is called twice per tab (inactive and active tint layers that crossfade), so keep it cheap.

### Props

| Prop              | Type                        | Description                                                                                             |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `onIndexSelected` | `(index: number) => void`   | Called on tap or scrub release.                                                                         |
| `theme`           | `Partial<GlassTabBarTheme>` | Colours and material; see below.                                                                        |
| `haptics`         | `boolean` (default `true`)  | Selection tick while scrubbing across tabs (iOS).                                                       |
| `blurTarget`      | `RefObject<View>`           | Android: the `BlurTargetView` wrapping the screens. Without it Android shows the wash only.             |
| `action`          | `GlassTabAction`            | Optional round glass button beside the pill.                                                            |
| `edgeFade`        | `string`                    | Optional solid colour gradient behind the bar. It hides content under the bar, so it is off by default. |

### Theme

| Key            | Description                                                                             |
| -------------- | --------------------------------------------------------------------------------------- |
| `activeTint`   | Icon and label colour of the selected tab. Use `accent` for a coloured selection.       |
| `inactiveTint` | Icon and label colour of the other tabs.                                                |
| `highlight`    | Sliding highlight pill colour.                                                          |
| `colorScheme`  | `"light"` / `"dark"`: glass and blur material. Match the **app** theme, not the system. |
| `glassTint`    | Tint passed to native liquid glass (iOS 26+). Keep it translucent (~20–25%).            |
| `blurWash`     | Translucent layer over the blur on Android and older iOS (~40–45%).                     |
| `rim`          | Hairline edge colour that catches the light.                                            |

These are raw colours chosen per theme in the layout (`isDark ? … : …`), because they are translucent material values with no semantic token.

### The action button

```ts
type GlassTabAction = {
  label: string; // accessibility label
  renderIcon: (props: { tint: string; size: number }) => ReactNode; // size is 24
  onPress: () => void;
};
```

- It is a separate glass circle, outside the scrub/tap area, so pressing it never changes tabs.
- It is not a route. Use it to open something: a `BottomSheet`, a modal route, a composer.
- Without `action`, the bar fills the full width as before.

### Minimize on scroll

- Scrolling down more than 3pt minimizes the bar; scrolling up, or being within 24pt of the top, expands it.
- Minimized, the bar goes from 58pt to 44pt tall, labels fade out, and the whole row (pill and action circle) moves 34pt inward per side.
- The action circle is always as tall as the bar, so it shrinks with it and stays round.
- Scrubbing or tapping the bar expands it again.

`LargeTitleScreen` attaches the scroll handler for you. For any other scrollable in a tab screen:

```tsx
const minimizeOnScroll = useMinimizeOnScroll();
const bottomInset = useGlassTabBarInset();

<Animated.ScrollView
  onScroll={minimizeOnScroll}
  scrollEventThrottle={16}
  contentContainerStyle={{ paddingBottom: bottomInset + 32 }}
/>;
```

It must be a Reanimated `Animated` scrollable. Compose it with your own handler via `useComposedEventHandler`.

### Tab transitions

`renderFadingTabScreen` is a drop-in `renderFn` for `TabSlot`: expo-router's default tab rendering plus a 220ms fade and tiny scale on the newly focused screen. The first screen on launch is not animated.

### Tuning

| Constant                               | Default     | Effect                                                |
| -------------------------------------- | ----------- | ----------------------------------------------------- |
| `EXPANDED_HEIGHT` / `MINIMIZED_HEIGHT` | `58` / `44` | Bar (and action circle) height.                       |
| `MINIMIZED_INSET`                      | `34`        | How far the row moves inward per side when minimized. |
| `BAR_MARGIN`                           | `12`        | Gap between the bar and the screen edges.             |
| `ACTION_GAP`                           | `10`        | Space between the pill and the action circle.         |
| `BLUR_INTENSITY`                       | `50`        | Fallback blur strength.                               |
| `MINIMIZE_SPRING` / `SLIDE_SPRING`     | —           | Springs for minimizing and for the sliding highlight. |

---

## Troubleshooting

**Header or tab bar looks dark or black on Android.**
Android blurs a snapshot of the `BlurTargetView`'s inner native view and fills unpainted pixels with the window background (black). Whatever is inside the target must paint its own background. `LargeTitleScreen` does this on its `ScrollView`; the layout does it on `TabSlot`. Setting `backgroundColor` on the `BlurTargetView` itself does **not** help.

**Blur shows before scrolling.**
Don't animate `BlurView`'s `intensity`: it re-renders after mount and resets it to its default. Fade a wrapping `Animated.View` instead (as `HeaderBlur` does).

**No blur at all on Android.**
Check that `blurTarget` is passed and the device runs Android 12+ (`dimezisBlurViewSdk31Plus` falls back to a plain wash below that).

**Liquid glass looks flat on iOS 26.**
Tint it with `glassTint` (passed as `tintColor`), never with `backgroundColor`, which paints over the glass.

**Scrubbing selects the wrong tab.**
The scrub and highlight math assumes the bar spans the window width minus margins, insets and the action circle. If you change the bar's layout, update `getPillWidth`.

**Extra empty space at the bottom of a stack screen.**
`useGlassTabBarInset()` returns 0 outside `TabBarMinimizeProvider`. If you see tab-bar padding, the screen is being rendered inside the tabs.

**After adding or removing a native package** (`expo-blur`, `expo-glass-effect`), rebuild the dev client and restart Metro.
