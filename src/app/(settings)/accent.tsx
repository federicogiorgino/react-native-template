import { LargeTitleScreen } from "@/components/large-title-screen";
import {
  ACCENTS,
  ACCENT_IDS,
  setAccentPreference,
  useAccentPreference,
} from "@/lib/accent-preference";
import { Ionicons } from "@expo/vector-icons";
import { cn, ListGroup, Separator, useThemeColor } from "heroui-native";
import type { JSX } from "react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function SettingsAccentScreen(): JSX.Element {
  const { t } = useTranslation();
  const accent = useThemeColor("accent");
  const selectedId = useAccentPreference();

  return (
    <LargeTitleScreen title={t("accent.title")} subtitle={t("accent.subtitle")}>
      <View className="gap-5 px-4 py-2">
        <ListGroup accessibilityRole="radiogroup" className="shadow-xs rounded-xl">
          {ACCENT_IDS.map((id, index) => {
            const option = ACCENTS[id];
            const selected = id === selectedId;
            return (
              <Fragment key={id}>
                {index > 0 ? <Separator className="mx-4" /> : null}
                <ListGroup.Item
                  onPress={() => setAccentPreference(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <ListGroup.ItemPrefix>
                    {/* The swatch shows the preset itself, so it uses the preset's own colour. */}
                    <View
                      className="size-5 rounded-full"
                      style={{ backgroundColor: option.accent }}
                    />
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className={cn(selected ? "font-bold" : "font-normal")}>
                      {t(`accent.${id}`)}
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
    </LargeTitleScreen>
  );
}
