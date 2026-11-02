import { LargeTitleScreen } from "@/components/large-title-screen";
import {
  getThemePreference,
  setThemePreference,
  THEME_PREFERENCES,
  ThemePreference,
} from "@/lib/theme-preference";
import { Ionicons } from "@expo/vector-icons";
import { cn, ListGroup, Separator, useThemeColor } from "heroui-native";
import type { JSX } from "react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const THEME_ICONS: Record<
  ThemePreference,
  "phone-portrait-outline" | "sunny-outline" | "moon-outline"
> = {
  system: "phone-portrait-outline",
  light: "sunny-outline",
  dark: "moon-outline",
};

export default function SettingsThemeScreen(): JSX.Element {
  const { t } = useTranslation();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");

  const [theme, setTheme] = useState<ThemePreference>(getThemePreference);

  function chooseTheme(preference: ThemePreference): void {
    setTheme(preference);
    setThemePreference(preference);
  }

  return (
    <LargeTitleScreen title={t("theme.title")} subtitle={t("theme.subtitle")}>
      <View className="gap-5 px-4 py-2">
        <View className="gap-1.5">
          <ListGroup accessibilityRole="radiogroup" className="shadow-xs rounded-xl">
            {THEME_PREFERENCES.map((preference, index) => {
              const selected = preference === theme;
              return (
                <Fragment key={preference}>
                  {index > 0 ? <Separator className="mx-4" /> : null}
                  <ListGroup.Item
                    onPress={() => chooseTheme(preference)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <ListGroup.ItemPrefix>
                      <Ionicons name={THEME_ICONS[preference]} size={18} color={muted} />
                    </ListGroup.ItemPrefix>
                    <ListGroup.ItemContent>
                      <ListGroup.ItemTitle className={cn(selected ? "font-bold" : "font-normal")}>
                        {t(`theme.${preference}`)}
                      </ListGroup.ItemTitle>
                    </ListGroup.ItemContent>
                    {selected && (
                      <ListGroup.ItemSuffix>
                        <Ionicons name="checkmark" size={18} color={accent} />
                      </ListGroup.ItemSuffix>
                    )}
                  </ListGroup.Item>
                </Fragment>
              );
            })}
          </ListGroup>
        </View>
      </View>
    </LargeTitleScreen>
  );
}
