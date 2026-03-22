"use client";

import { Building2, Menu } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getRouteMetadata } from "@/lib/app-config";
import { activeSession, organization } from "@/lib/mock-data";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = getRouteMetadata(pathname);
  const sessionRole = searchParams.get("role") === "client" ? "client" : "consultant";
  const activePerson =
    pathname.startsWith("/session") && sessionRole === "client"
      ? activeSession.participants.find((participant) => participant.role === "client")
          ?.name ?? "Client"
      : organization.consultantName;

  return (
    <div className="border-b border-[var(--border)] bg-white/70 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            className="mt-0.5 md:hidden"
            onClick={onMenuClick}
            size="icon"
            type="button"
            variant="outline"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open navigation</span>
          </Button>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {copy.title}
            </h2>
            <p className="text-sm text-[var(--muted)]">{copy.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 md:flex">
            <Building2 className="h-4 w-4 text-[var(--muted)]" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              {organization.name}
            </p>
          </div>
          <button
            className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            type="button"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {initialsFromName(activePerson)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {activePerson}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
