import { redirect } from "next/navigation";

import { DEMO_SESSION_ID } from "@/lib/live-session";

export default function SessionPage() {
  redirect(`/session/${DEMO_SESSION_ID}?role=consultant`);
}
