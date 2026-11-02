import { EmptyState } from "@/components/empty-state";
import { LargeTitleScreen } from "@/components/large-title-screen";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

import { authClient } from "../../lib/auth-client";
import { config } from "../../lib/config";

export default function HomeScreen(): JSX.Element {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const name = session?.user.name;

  return (
    <LargeTitleScreen
      title={name ? t("home.greeting", { name }) : t("home.title")}
      subtitle={t("home.subtitle", { app: config.appName })}
    >
      <EmptyState
        icon="home-outline"
        title={t("home.emptyTitle")}
        description={t("home.emptyDescription")}
      />
    </LargeTitleScreen>
  );
}
