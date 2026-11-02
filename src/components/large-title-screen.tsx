import { useGlassTabBarInset, useMinimizeOnScroll } from "@/components/glass-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurTargetView, BlurView } from "expo-blur";
import { useNavigation } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { Typography } from "heroui-native/text";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Platform, StyleSheet, View, type ScrollViewProps } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useComposedEventHandler,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { useUniwind } from "uniwind";

/* ============================================================================
 * Public types
 * ========================================================================== */

export type LargeTitleScreenProps = {
  title: string;
  /** Small uppercase line above the large title, e.g. "10 entries · 3 reviews". */
  eyebrow?: string;
  subtitle?: string;
  /**
   * Full-bleed content above the large title (artwork, cover image...). It starts under the
   * status bar and the action buttons float over it until the header collapses.
   */
  hero?: ReactNode;
  /** Rendered after the automatic back button. */
  leftContent?: ReactNode;
  /** Trailing actions; `HeaderIconButton` matches the back button. */
  rightContent?: ReactNode;
  /** Overrides the automatic back button (shown when an enclosing stack can pop). */
  showBackButton?: boolean;
  /**
   * Called once each time the user scrolls within `END_REACHED_OFFSET` of the bottom, for
   * infinite lists. It re-arms when the content grows, so load the next page here.
   */
  onEndReached?: () => void;
  /** Pass `refreshControl` for pull-to-refresh; see `HEADER_BAR_HEIGHT` for its offset. */
  scrollViewProps?: Omit<ScrollViewProps, "children" | "onScroll">;
  children: ReactNode;
};

/* ============================================================================
 * Constants
 * ========================================================================== */

/** Compact bar height below the safe-area inset; leaves room around the action buttons. */
const BAR_HEIGHT = 56;
/** Height of the compact bar below the safe-area inset, for offsetting refresh spinners. */
export const HEADER_BAR_HEIGHT = BAR_HEIGHT;
/** Distance from the bottom (in points) at which `onEndReached` fires. */
const END_REACHED_OFFSET = 320;
/** Minimum touch target (iOS HIG / Material): 44x44. */
const ACTION_SIZE = 44;
const TITLE_ACTION_GAP = 8;
/** Horizontal padding of the action bar. */
const ACTIONS_PADDING = 14;
/** The large title counts as collapsed once the compact title is more than half visible. */
const COLLAPSED_THRESHOLD = 0.5;
/** Cap on font scaling for the fixed-height compact bar. */
const COMPACT_MAX_FONT_MULTIPLIER = 1.3;
const BOTTOM_PADDING = 32;
const BLUR_INTENSITY = 60;
const TITLE_FADE = { duration: 150, easing: Easing.inOut(Easing.cubic) } as const;

/** Distances below the top safe-area inset where the large title starts / finishes fading. */
const FADE_RANGES = {
  plain: [36, 8],
  supporting: [20, -8],
} as const;

/* ============================================================================
 * Back navigation: find the nearest enclosing *stack* that can pop, and pop that same stack.
 * Tab history is deliberately skipped so a tab root never shows a back button.
 * Uses only the public `useNavigation`; the structural type avoids importing navigation internals.
 * ========================================================================== */

type NavigationNode = {
  getState: () => { type?: string; index?: number } | undefined;
  getParent: () => NavigationNode | undefined;
  goBack: () => void;
  addListener: (event: "focus" | "state", callback: () => void) => () => void;
};

function findPoppableStack(navigation: NavigationNode | undefined): NavigationNode | undefined {
  for (let node = navigation; node != null; node = node.getParent()) {
    const state = node.getState();
    if (state?.type === "stack" && (state.index ?? 0) > 0) return node;
  }
  return undefined;
}

function useStackBack() {
  const navigation = useNavigation() as unknown as NavigationNode;
  const [canGoBack, setCanGoBack] = useState(() => findPoppableStack(navigation) != null);

  useEffect(() => {
    const update = () => setCanGoBack(findPoppableStack(navigation) != null);
    update();
    const unsubscribeFocus = navigation.addListener("focus", update);
    const unsubscribeState = navigation.addListener("state", update);
    return () => {
      unsubscribeFocus();
      unsubscribeState();
    };
  }, [navigation]);

  const goBack = useCallback(() => findPoppableStack(navigation)?.goBack(), [navigation]);
  return { canGoBack, goBack };
}

/* ============================================================================
 * Small pieces
 * ========================================================================== */

type HeaderIconButtonProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
};

export function HeaderIconButton({ icon, label, onPress }: HeaderIconButtonProps) {
  const accent = useThemeColor("accent");
  return (
    <Button
      isIconOnly
      size="sm"
      variant="tertiary"
      className="rounded-full"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
    >
      <Ionicons name={icon} size={20} color={accent} />
    </Button>
  );
}

/**
 * Large title block. On every scroll frame it measures its own position on screen, fades and
 * lifts out as it reaches the bar, and writes the 0..1 collapse progress into `compact`.
 * Measuring the real position means anything above it (a hero) is accounted for automatically.
 */
function CollapsingTitle({
  scrollY,
  compact,
  fadeStart,
  fadeEnd,
  children,
}: {
  scrollY: SharedValue<number>;
  compact: SharedValue<number>;
  /** Distance below the top safe-area inset where the title starts fading. */
  fadeStart: number;
  /** Distance below the top safe-area inset where the title is fully gone. */
  fadeEnd: number;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const { top: topInset } = useSafeAreaInsets();
  const ref = useAnimatedRef<Animated.View>();

  // One measurement per frame feeds `compact`; the style below reads it.
  useAnimatedReaction(
    () => {
      scrollY.get(); // Re-run on every scroll frame.
      const measured = measure(ref);
      if (!measured) return 0;
      return interpolate(
        measured.pageY,
        [topInset + fadeStart, topInset + fadeEnd],
        [0, 1],
        Extrapolation.CLAMP
      );
    },
    (progress) => compact.set(progress)
  );

  const style = useAnimatedStyle(() => {
    const progress = compact.get();
    if (reduced) {
      return { opacity: progress >= 1 ? 0 : 1 };
    }
    return {
      opacity: 1 - progress,
      transform: [{ translateY: -12 * progress }],
    };
  });

  return (
    <Animated.View ref={ref} style={style} collapsable={false}>
      {children}
    </Animated.View>
  );
}

/** Compact title in the bar; fades and rises in as the large title collapses. */
function CompactTitle({
  title,
  compact,
  collapsed,
  inset,
}: {
  title: string;
  compact: SharedValue<number>;
  collapsed: boolean;
  inset: number;
}) {
  const reduced = useReducedMotion();
  const style = useAnimatedStyle(() => {
    const progress = compact.get();
    if (reduced) {
      return { opacity: progress > COLLAPSED_THRESHOLD ? 1 : 0 };
    }
    return {
      opacity: withTiming(progress, TITLE_FADE),
      transform: [{ translateY: withTiming(interpolate(progress, [0, 1], [10, 0]), TITLE_FADE) }],
    };
  });

  return (
    <Animated.View
      style={[styles.bar, { paddingHorizontal: inset, pointerEvents: "none" }, style]}
      accessibilityElementsHidden={!collapsed}
      importantForAccessibility={collapsed ? "auto" : "no-hide-descendants"}
    >
      <Typography
        accessibilityRole="header"
        className="w-full text-center text-[17px]/[22px] font-bold text-foreground"
        numberOfLines={1}
        maxFontSizeMultiplier={COMPACT_MAX_FONT_MULTIPLIER}
        style={{ includeFontPadding: false }}
      >
        {title}
      </Typography>
    </Animated.View>
  );
}

/** Blur behind the compact bar; fades in with the compact title. */
function HeaderBlur({
  compact,
  height,
  blurTarget,
}: {
  compact: SharedValue<number>;
  height: number;
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
}) {
  const isDark = useUniwind().theme === "dark";
  // Fade a wrapper rather than animating `intensity`: BlurView re-renders after mount (to resolve
  // `blurTarget`) and its JS `intensity` default would overwrite the animated value.
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(compact.get(), [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.blur, { height, pointerEvents: "none" }, fadeStyle]}>
      <BlurView
        // A native material, not a color: there is no semantic token for a blur tint.
        tint={isDark ? "dark" : "light"}
        intensity={BLUR_INTENSITY}
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      {/* A light wash of the theme background keeps the bar the same hue as the screen. */}
      <View className="absolute inset-0 bg-background opacity-10" />
    </Animated.View>
  );
}

/* ============================================================================
 * Screen
 * ========================================================================== */

export function LargeTitleScreen({
  title,
  eyebrow,
  subtitle,
  hero,
  leftContent,
  rightContent,
  showBackButton,
  onEndReached,
  scrollViewProps,
  children,
}: LargeTitleScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  const minimizeTabBar = useMinimizeOnScroll();
  const { t } = useTranslation();
  const { canGoBack, goBack } = useStackBack();
  const background = useThemeColor("background");
  const blurTarget = useRef<ComponentRef<typeof View>>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(ACTION_SIZE);
  const [rightWidth, setRightWidth] = useState(ACTION_SIZE);

  // `CollapsingTitle` writes the collapse progress into `compact`, which drives the compact
  // title and the blur.
  const scrollY = useSharedValue(0);
  const compact = useSharedValue(0);
  const nearEnd = useSharedValue(false);
  const trackScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
    if (!onEndReached) return;

    const distance =
      event.contentSize.height - (event.contentOffset.y + event.layoutMeasurement.height);
    const isNear = distance < END_REACHED_OFFSET;
    if (isNear !== nearEnd.get()) {
      nearEnd.set(isNear);
      if (isNear) scheduleOnRN(onEndReached);
    }
  });
  const onScroll = useComposedEventHandler([trackScroll, minimizeTabBar]);

  // Notify JS only when the threshold is crossed.
  useAnimatedReaction(
    () => compact.get() > COLLAPSED_THRESHOLD,
    (isCollapsed, previous) => {
      if (isCollapsed !== previous) scheduleOnRN(setCollapsed, isCollapsed);
    }
  );

  const hasHero = hero != null;
  const backVisible = showBackButton ?? canGoBack;
  const barHeight = insets.top + BAR_HEIGHT;
  // A hero bleeds under the bar; plain screens start their content below it.
  const contentTopInset = hasHero ? 0 : barHeight;
  const [fadeStart, fadeEnd] = eyebrow || subtitle ? FADE_RANGES.supporting : FADE_RANGES.plain;
  // Symmetric, clearing the wider action slot.
  const compactTitleInset =
    ACTIONS_PADDING + Math.max(leftWidth, rightWidth, ACTION_SIZE) + TITLE_ACTION_GAP;

  return (
    <View className="flex-1 bg-background">
      <BlurTargetView ref={blurTarget} style={styles.fill}>
        <Animated.ScrollView
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          showsHorizontalScrollIndicator={false}
          {...scrollViewProps}
          // Android blurs a snapshot of the target's *inner* native view and fills unpainted
          // pixels with the window background (black here), so the background must be painted
          // by the content itself.
          style={[{ backgroundColor: background }, scrollViewProps?.style]}
          {...(Platform.OS === "ios"
            ? { scrollIndicatorInsets: { top: barHeight, bottom: bottomInset } }
            : null)}
          automaticallyAdjustsScrollIndicatorInsets={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentContainerStyle={[
            scrollViewProps?.contentContainerStyle,
            { paddingTop: contentTopInset, paddingBottom: BOTTOM_PADDING + bottomInset },
          ]}
        >
          {hero}
          <CollapsingTitle
            scrollY={scrollY}
            compact={compact}
            fadeStart={fadeStart}
            fadeEnd={fadeEnd}
          >
            <View
              className={hasHero ? "gap-0.5 px-5 pt-4 pb-1" : "gap-0.5 px-5 pb-1"}
              accessibilityElementsHidden={collapsed}
              importantForAccessibility={collapsed ? "no-hide-descendants" : "auto"}
            >
              {eyebrow ? (
                <Typography
                  className="text-[13px]/[18px] font-semibold tracking-[0.8px] text-muted uppercase"
                  numberOfLines={1}
                >
                  {eyebrow}
                </Typography>
              ) : null}
              <Typography
                accessibilityRole="header"
                className="text-[34px]/[41px] font-bold tracking-[0.4px] text-foreground"
                numberOfLines={2}
              >
                {title}
              </Typography>
              {subtitle ? (
                <Typography className="text-[15px]/[20px] font-medium text-muted" numberOfLines={2}>
                  {subtitle}
                </Typography>
              ) : null}
            </View>
          </CollapsingTitle>
          {children}
        </Animated.ScrollView>
      </BlurTargetView>

      <HeaderBlur compact={compact} height={barHeight} blurTarget={blurTarget} />

      <View style={[styles.header, { height: barHeight, pointerEvents: "box-none" }]}>
        <CompactTitle
          title={title}
          compact={compact}
          collapsed={collapsed}
          inset={compactTitleInset}
        />
        <View style={[styles.bar, styles.actions, { pointerEvents: "box-none" }]}>
          <View
            style={[styles.slot, styles.slotStart, { pointerEvents: "box-none" }]}
            onLayout={(event) => setLeftWidth(event.nativeEvent.layout.width)}
          >
            {backVisible ? (
              <HeaderIconButton icon="arrow-back" label={t("common.back")} onPress={goBack} />
            ) : null}
            {leftContent}
          </View>
          <View
            style={[styles.slot, styles.slotEnd, { pointerEvents: "box-none" }]}
            onLayout={(event) => setRightWidth(event.nativeEvent.layout.width)}
          >
            {rightContent}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  blur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
  },
  /** The compact bar: the bottom `BAR_HEIGHT` of the header, below the status bar. */
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: ACTIONS_PADDING,
  },
  slot: {
    minWidth: ACTION_SIZE,
    minHeight: ACTION_SIZE,
    flexDirection: "row",
    alignItems: "center",
    gap: TITLE_ACTION_GAP,
  },
  slotStart: {
    justifyContent: "flex-start",
  },
  slotEnd: {
    justifyContent: "flex-end",
  },
});
