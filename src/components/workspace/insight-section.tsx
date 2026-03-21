import * as React from "react";

import { CardPanel } from "@/components/ui/card-panel";

interface InsightSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function InsightSection({
  title,
  description,
  action,
  children,
  ...props
}: InsightSectionProps) {
  return (
    <CardPanel title={title} description={description} action={action} {...props}>
      {children}
    </CardPanel>
  );
}

