import type { JSX } from "react";
import { Pressable, Text, View } from "react-native";

interface ErrorScreenProps {
  title: string;
  message?: string;
  actionLabel: string;
  onAction: () => void;
}

/**
 * Full-screen error state built from plain React Native primitives and theme classes, so it
 * still renders when the error happened above the HeroUI provider (root error boundary).
 */
export function ErrorScreen({
  title,
  message,
  actionLabel,
  onAction,
}: ErrorScreenProps): JSX.Element {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
      <Text accessibilityRole="header" className="text-center text-2xl font-bold text-foreground">
        {title}
      </Text>
      {message ? <Text className="text-center text-base text-muted">{message}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        className="mt-4 min-h-11 items-center justify-center rounded-2xl bg-accent px-6 active:opacity-80"
      >
        <Text className="text-base font-semibold text-accent-foreground">{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
