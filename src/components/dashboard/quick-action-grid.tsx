import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card-panel";
import type { QuickAction } from "@/lib/types";

interface QuickActionGridProps {
  actions: QuickAction[];
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <CardPanel
          key={action.id}
          className="flex h-full flex-col justify-between rounded-2xl"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {action.title}
            </p>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {action.description}
            </p>
          </div>
          <Button asChild className="mt-6 w-full justify-between" variant="outline">
            <Link href={action.href}>
              Open
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardPanel>
      ))}
    </div>
  );
}

