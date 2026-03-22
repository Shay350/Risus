export const appName = "Risus";

export const navItems = [
  { label: "Session", href: "/session/session-live-101?role=consultant" },
  { label: "Analysis", href: "/analysis" },
  { label: "Deliverables", href: "/deliverables" },
] as const;

export const routeMetadata = {
  "/session": {
    title: "Session",
    description: "Live call, translation, and transcript stream.",
  },
  "/analysis": {
    title: "Analysis",
    description: "Focused insight review.",
  },
  "/deliverables": {
    title: "Deliverables",
    description: "Unified output queue.",
  },
} as const;

export type RoutePath = keyof typeof routeMetadata;

export function getRouteMetadata(pathname: string) {
  if (pathname.startsWith("/session")) {
    return routeMetadata["/session"];
  }

  if (pathname.startsWith("/analysis")) {
    return routeMetadata["/analysis"];
  }

  if (pathname.startsWith("/deliverables")) {
    return routeMetadata["/deliverables"];
  }

  return routeMetadata["/session"];
}
