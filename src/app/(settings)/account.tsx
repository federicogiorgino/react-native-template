import { LargeTitleScreen } from "@/components/large-title-screen";
import { authClient } from "@/lib/auth-client";
import { useAuthGate } from "@/lib/auth-gate";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, ListGroup, Separator, Spinner, useThemeColor } from "heroui-native";
import type { JSX } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function SettingsAccountScreen(): JSX.Element {
  const { t } = useTranslation();
  const danger = useThemeColor("danger");
  const muted = useThemeColor("muted");
  const { signOut } = useAuthGate();
  const { data: session } = authClient.useSession();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut(): Promise<void> {
    if (isSigningOut) return;
    setError(null);
    setIsSigningOut(true);
    const result = await signOut();
    // On success the root layout swaps to the sign-in screen, so only failures need handling.
    if (result.error) {
      setError(result.error);
      setIsSigningOut(false);
    }
  }

  return (
    <LargeTitleScreen title={t("account.title")} subtitle={t("account.subtitle")}>
      <View className="gap-5 px-4 py-2">
        <View className="gap-2.5">
          <ListGroup className="rounded-xl shadow-xs">
            <ListGroup.Item disabled>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{session?.user.name}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>{session?.user.email}</ListGroup.ItemDescription>
              </ListGroup.ItemContent>
            </ListGroup.Item>
            <Separator className="mx-4" />
            <ListGroup.Item onPress={() => router.push("/change-password")}>
              <ListGroup.ItemPrefix>
                <Ionicons name="key-outline" size={20} color={muted} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="font-normal">
                  {t("account.changePassword")}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </ListGroup>
        </View>

        {error ? (
          <Alert status="danger" className="shadow-xs rounded-xl">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title className="text-danger">{t("account.signOutFailed")}</Alert.Title>
              <Alert.Description className="text-danger">{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        <View className="gap-2.5">
          <ListGroup className="shadow-xs rounded-xl">
            <ListGroup.Item
              onPress={handleSignOut}
              disabled={isSigningOut}
              accessibilityLabel={isSigningOut ? t("account.signingOut") : undefined}
            >
              <ListGroup.ItemPrefix>
                {isSigningOut ? (
                  <Spinner size="sm" color={danger} />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color={danger} />
                )}
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-danger font-normal">
                  {t("account.signOut")}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
            </ListGroup.Item>
            <Separator className="mx-4" />
            <ListGroup.Item onPress={() => router.push("/delete-account")}>
              <ListGroup.ItemPrefix>
                <Ionicons name="trash-outline" size={20} color={danger} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-danger font-normal">
                  {t("account.deleteAccount")}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
            </ListGroup.Item>
          </ListGroup>
        </View>
      </View>
    </LargeTitleScreen>
  );
}
