import * as React from "react";

import { CardPanel } from "@/components/ui/card-panel";

interface SummaryBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SummaryBlock({
  title,
  description,
  action,
  children,
  ...props
}: SummaryBlockProps) {
  return (
    <CardPanel action={action} title={title} description={description} {...props}>
      {children}
    </CardPanel>
  );
}
