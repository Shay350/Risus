export const appName = "Risus";

export const navItems = [
  { label: "Session", href: "/session" },
  { label: "Analysis", href: "/analysis" },
  { label: "Deliverables", href: "/deliverables" },
  { label: "Client", href: "/client" },
] as const;

export const routeMetadata = {
  "/session": {
    title: "Session",
    description: "Live call and language stream.",
  },
  "/analysis": {
    title: "Analysis",
    description: "Focused insight review.",
  },
  "/deliverables": {
    title: "Deliverables",
    description: "Unified output queue.",
  },
  "/client": {
    title: "Client Dashboard",
    description: "Simple view of session progress and prepared files.",
  },
} as const;

export type RoutePath = keyof typeof routeMetadata;
