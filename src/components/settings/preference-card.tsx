import * as React from "react";

import { CardPanel } from "@/components/ui/card-panel";

interface PreferenceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PreferenceCard({
  title,
  description,
  children,
  ...props
}: PreferenceCardProps) {
  return (
    <CardPanel title={title} description={description} {...props}>
      <div className="space-y-4">{children}</div>
    </CardPanel>
  );
}

