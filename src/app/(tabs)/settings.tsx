import { LargeTitleScreen } from "@/components/large-title-screen";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ListGroup, Separator, Typography, useThemeColor } from "heroui-native";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ACCENTS, useAccentPreference } from "../../lib/accent-preference";
import { authClient } from "../../lib/auth-client";
import { config } from "../../lib/config";
import { LANGUAGES, useLanguagePreference } from "../../lib/i18n";

function SectionLabel({ children }: { children: string }): JSX.Element {
  return (
    <Typography.Paragraph type="body-xs" color="muted" className="px-2 font-bold uppercase">
      {children}
    </Typography.Paragraph>
  );
}

export default function SettingsScreen(): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const muted = useThemeColor("muted");
  const accentId = useAccentPreference();
  const language = useLanguagePreference();

  return (
    <LargeTitleScreen title={t("settings.title")}>
      <View className="gap-5 px-4 py-2">
        <View className="gap-2.5">
          <ListGroup className="rounded-xl shadow-xs">
            <ListGroup.Item onPress={() => router.push("/account")}>
              <ListGroup.ItemPrefix>
                <Ionicons name="person-outline" size={18} color={muted} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="font-normal">
                  {session?.user.name}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix className="flex-row items-center gap-2">
                {/* <ListGroup.ItemTitle>{session?.user.email}</ListGroup.ItemTitle> */}
                <Ionicons name="chevron-forward-outline" size={16} color={muted} />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
          </ListGroup>
        </View>

        <View className="gap-2.5">
          <SectionLabel>{t("settings.appearance")}</SectionLabel>
          <ListGroup className="rounded-xl shadow-xs">
            <ListGroup.Item onPress={() => router.push("/theme")} accessibilityRole="radio">
              <ListGroup.ItemPrefix>
                <Ionicons name="color-palette-outline" size={18} color={muted} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="font-normal">
                  {t("settings.selectTheme")}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
            <Separator className="mx-4" />
            <ListGroup.Item onPress={() => router.push("/accent")}>
              <ListGroup.ItemPrefix>
                <Ionicons name="color-fill-outline" size={18} color={muted} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="font-normal">
                  {t("settings.accentColor")}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix className="flex-row items-center gap-2">
                <View
                  className="size-4 rounded-full"
                  style={{ backgroundColor: ACCENTS[accentId].accent }}
                />
                <Ionicons name="chevron-forward-outline" size={16} color={muted} />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
            <Separator className="mx-4" />
            <ListGroup.Item onPress={() => router.push("/language")}>
              <ListGroup.ItemPrefix>
                <Ionicons name="language-outline" size={18} color={muted} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="font-normal">
                  {t("settings.language")}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix className="flex-row items-center gap-2">
                <Typography type="body-sm" color="muted">
                  {language === "system" ? t("language.system") : LANGUAGES[language].label}
                </Typography>
                <Ionicons name="chevron-forward-outline" size={16} color={muted} />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
          </ListGroup>
        </View>

        <Typography.Paragraph type="body-xs" color="muted" className="text-center">
          {config.appName} {Constants.expoConfig?.version ?? ""}
        </Typography.Paragraph>
      </View>
    </LargeTitleScreen>
  );
}
