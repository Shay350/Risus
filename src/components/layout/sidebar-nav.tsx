"use client";

import { Archive, FlaskConical, PhoneCall, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { activeSession, organization } from "@/lib/mock-data";

const navigation = [
  {
    href: "/session",
    label: "Session",
    icon: PhoneCall,
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: Sparkles,
  },
  {
    href: "/deliverables",
    label: "Case Repository",
    icon: Archive,
  },
  {
    href: "/translation-test",
    label: "Translation Lab",
    icon: FlaskConical,
  },
];

interface SidebarNavProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ mobile = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="space-y-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Risus
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Consultation tool
            </h1>
          </div>
          <StatusBadge tone="accent" pulse>
            Live
          </StatusBadge>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/85 p-4">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {activeSession.title}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{organization.name}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 py-5">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-[var(--muted)] hover:bg-white/80 hover:text-[var(--foreground)]",
              )}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] pt-5">
        <div
          className={cn(
            "rounded-2xl border border-[var(--border)] bg-white/70 p-4",
            mobile ? "" : "surface-grid",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Current flow
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            Call, review insights, then package deliverables.
          </p>
        </div>
      </div>
    </div>
  );
}
