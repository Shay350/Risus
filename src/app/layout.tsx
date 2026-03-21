import type { Metadata } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";

import "@/app/globals.css";
import { appName } from "@/lib/app-config";

export const metadata: Metadata = {
  title: {
    default: `${appName} Workspace`,
    template: `%s | ${appName}`,
  },
  description:
    "Operational AI workspace for multilingual consultation calls, live transcription, and document workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
