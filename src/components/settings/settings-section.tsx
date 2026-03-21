import type { ReactNode } from "react";

import { CardPanel } from "@/components/ui/card-panel";

interface SettingsSectionProps {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  action,
  children,
}: SettingsSectionProps) {
  return (
    <CardPanel title={title} description={description} action={action}>
      <div className="space-y-3">{children}</div>
    </CardPanel>
  );
}

