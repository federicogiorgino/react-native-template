import { EmptyState } from "@/components/empty-state";
import { LargeTitleScreen } from "@/components/large-title-screen";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

export default function ActivityScreen(): JSX.Element {
  const { t } = useTranslation();

  return (
    <LargeTitleScreen title={t("activity.title")}>
      <EmptyState
        icon="trending-up-outline"
        title={t("activity.emptyTitle")}
        description={t("activity.emptyDescription")}
      />
    </LargeTitleScreen>
  );
}
