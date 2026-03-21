import Link from "next/link";
import { FileOutput, Share2 } from "lucide-react";

import { ActionBar } from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";

export function GenerateDocumentBar() {
  return (
    <ActionBar
      title="Ready to package deliverables"
      description="The current insight set supports a bilingual checklist, a case worker cover note, and an export-ready post-call summary."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/summaries">
              <Share2 className="h-4 w-4" />
              Review summary
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/documents">
              <FileOutput className="h-4 w-4" />
              Generate documents
            </Link>
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--muted)]">
        Recommended next step: validate the high-severity evidence risk before sharing the client packet.
      </p>
    </ActionBar>
  );
}

