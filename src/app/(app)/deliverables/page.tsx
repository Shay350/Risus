import { Download, Languages, Sparkles } from "lucide-react";

import { OutputList } from "@/components/deliverables/output-list";
import { OutputPreview } from "@/components/deliverables/output-preview";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { deliverablesQueue } from "@/lib/mock-data";

export default function DeliverablesPage() {
  const selectedItem = deliverablesQueue[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deliverables"
        title="Operational output queue"
        description="One place for summaries, translated files, and export packets."
        actions={
          <>
            <Button variant="outline">
              <Languages className="h-4 w-4" />
              Translate
            </Button>
            <Button variant="outline">
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <OutputList items={deliverablesQueue} />
        <OutputPreview item={selectedItem} />
      </div>
    </div>
  );
}

