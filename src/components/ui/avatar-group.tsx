import * as React from "react";

import { cn } from "@/lib/utils";

interface AvatarGroupItem {
  id: string;
  name: string;
  initials?: string;
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AvatarGroupItem[];
  limit?: number;
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarGroup({
  className,
  items,
  limit = 4,
  ...props
}: AvatarGroupProps) {
  const visible = items.slice(0, limit);
  const overflow = items.length - visible.length;

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visible.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-200 text-xs font-semibold text-slate-700",
            index > 0 ? "-ml-2.5" : "",
          )}
          title={item.name}
        >
          {item.initials ?? initialsFromName(item.name)}
        </div>
      ))}
      {overflow > 0 ? (
        <div className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-900 text-xs font-semibold text-white">
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}
