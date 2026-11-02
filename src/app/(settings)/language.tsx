import { LargeTitleScreen } from "@/components/large-title-screen";
import {
  LANGUAGES,
  LANGUAGE_CODES,
  setLanguagePreference,
  useLanguagePreference,
  type LanguagePreference,
} from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { cn, ListGroup, Separator, useThemeColor } from "heroui-native";
import type { JSX } from "react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const OPTIONS: readonly LanguagePreference[] = ["system", ...LANGUAGE_CODES];

export default function SettingsLanguageScreen(): JSX.Element {
  const { t } = useTranslation();
  const accent = useThemeColor("accent");
  const selected = useLanguagePreference();

  return (
    <LargeTitleScreen title={t("language.title")} subtitle={t("language.subtitle")}>
      <View className="gap-5 px-4 py-2">
        <ListGroup accessibilityRole="radiogroup" className="shadow-xs rounded-xl">
          {OPTIONS.map((option, index) => {
            const isSelected = option === selected;
            return (
              <Fragment key={option}>
                {index > 0 ? <Separator className="mx-4" /> : null}
                <ListGroup.Item
                  onPress={() => setLanguagePreference(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle className={cn(isSelected ? "font-bold" : "font-normal")}>
                      {option === "system" ? t("language.system") : LANGUAGES[option].label}
                    </ListGroup.ItemTitle>
                  </ListGroup.ItemContent>
                  {isSelected && (
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
