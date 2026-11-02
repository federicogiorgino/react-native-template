// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurTargetView } from "expo-blur";
import { useRouter } from "expo-router";
import { useRef, type ComponentRef } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useUniwind } from "uniwind";
import { useThemeColor } from "heroui-native";
import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";

import {
  GlassTabBar,
  GlassTabButton,
  TabBarMinimizeProvider,
  renderFadingTabScreen,
  type GlassTabItem,
} from "@/components/glass-tabs";
import { useNotify } from "@/lib/use-notify";

const ITEMS: (Omit<GlassTabItem, "label"> & {
  href: string;
  label: "tabs.home" | "tabs.activity" | "tabs.settings";
})[] = [
  {
    name: "index",
    href: "/",
    label: "tabs.home",
    renderIcon: ({ tint }) => <Ionicons name="home" size={21} color={tint} />,
  },
  {
    name: "activity",
    href: "/activity",
    label: "tabs.activity",
    renderIcon: ({ tint }) => <Ionicons name="trending-up" size={21} color={tint} />,
  },
  {
    name: "settings",
    href: "/settings",
    label: "tabs.settings",
    renderIcon: ({ tint }) => <Ionicons name="settings" size={21} color={tint} />,
  },
];

export default function AppTabs() {
  const { t } = useTranslation();
  const router = useRouter();
  const isDark = useUniwind().theme === "dark";
  const background = useThemeColor("background");
  const foreground = useThemeColor("foreground");
  const muted = useThemeColor("muted");
  const accent = useThemeColor("accent");
  const notify = useNotify();
  // Android blurs a snapshot of this target behind the tab bar.
  const blurTarget = useRef<ComponentRef<typeof View>>(null);

  return (
    <TabBarMinimizeProvider>
      <Tabs>
        <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
          <TabSlot
            style={{ flex: 1, backgroundColor: background }}
            renderFn={renderFadingTabScreen}
          />
        </BlurTargetView>
        <TabList asChild>
          <GlassTabBar
            onIndexSelected={(i) => router.navigate(ITEMS[i].href as never)}
            blurTarget={blurTarget}
            action={{
              label: t("tabs.newEntry"),
              renderIcon: ({ size }) => <Ionicons name="add" size={size} color={accent} />,
              // Placeholder until the composer exists.
              onPress: () => notify.info(t("tabs.newEntry"), t("tabs.newEntrySoon")),
            }}
            theme={{
              activeTint: foreground,
              inactiveTint: muted,
              highlight: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.07)",
              colorScheme: isDark ? "dark" : "light",
              glassTint: isDark ? "rgba(10,10,12,0.2)" : "rgba(255,255,255,0.25)",
              blurWash: isDark ? "rgba(18,18,20,0.4)" : "rgba(255,255,255,0.45)",
              rim: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
            }}
            haptics
          >
            {ITEMS.map(({ href, ...item }, index) => (
              <TabTrigger key={item.name} name={item.name} href={href as never} asChild>
                <GlassTabButton item={{ ...item, label: t(item.label) }} index={index} />
              </TabTrigger>
            ))}
          </GlassTabBar>
        </TabList>
      </Tabs>
    </TabBarMinimizeProvider>
  );
}
