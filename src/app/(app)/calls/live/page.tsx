import { redirect } from "next/navigation";

export default function LegacyLiveCallPage() {
  redirect("/session");
}

