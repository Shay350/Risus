import { redirect } from "next/navigation";

export default function LegacyCallSetupPage() {
  redirect("/session");
}

