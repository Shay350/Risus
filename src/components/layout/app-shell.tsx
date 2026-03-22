"use client";

import { X } from "lucide-react";
import { Suspense, type ReactNode, useState } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-[var(--foreground)]">
      <div className="flex min-h-screen">
        <aside className="app-panel-strong sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-[var(--border)] md:block">
          <Suspense fallback={<div className="h-full" />}>
            <SidebarNav />
          </Suspense>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              aria-label="Close navigation overlay"
              className="absolute inset-0 bg-slate-950/35"
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <aside className="app-panel-strong absolute inset-y-0 left-0 w-[88vw] max-w-[320px] border-r border-[var(--border)]">
              <div className="flex justify-end p-3">
                <Button
                  onClick={() => setMobileOpen(false)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close navigation</span>
                </Button>
              </div>
              <Suspense fallback={<div className="h-full" />}>
                <SidebarNav mobile onNavigate={() => setMobileOpen(false)} />
              </Suspense>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<div className="border-b border-[var(--border)] bg-white/70 px-4 py-4 md:px-8" />}>
            <TopBar onMenuClick={() => setMobileOpen(true)} />
          </Suspense>
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
