import { LiveSessionClient } from "@/components/session/live-session-client";
import { resolveSession } from "@/lib/live-session";
import type { SessionRole } from "@/lib/types";

interface SessionRoutePageProps {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams: Promise<{
    role?: string;
  }>;
}

function normalizeRole(role?: string): SessionRole {
  return role === "client" ? "client" : "consultant";
}

export default async function SessionRoutePage({
  params,
  searchParams,
}: SessionRoutePageProps) {
  const { sessionId } = await params;
  const { role } = await searchParams;
  const session = resolveSession(sessionId);

  return <LiveSessionClient role={normalizeRole(role)} session={session} />;
}
