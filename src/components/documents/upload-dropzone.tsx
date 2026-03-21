import { ArrowUpFromLine, FileText, Languages, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card-panel";

export function UploadDropzone() {
  return (
    <CardPanel
      title="Drop files to extract or translate"
      description="Queue scans, forms, or notes for OCR, translation, or AI-assisted document generation."
      className="h-full"
    >
      <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--background-elevated)] p-8">
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--accent)]">
              <ArrowUpFromLine className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                Upload intake packets, scans, or generated drafts
              </p>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Supported for mock flows: intake PDFs, lease documents, benefit letters,
                identity scans, and post-call document packs.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">
              <Languages className="h-4 w-4" />
              Translate file
            </Button>
            <Button variant="outline">
              <Sparkles className="h-4 w-4" />
              Generate packet
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            "OCR extraction from scans",
            "Bilingual translation handoff",
            "Document generation from notes",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[var(--border)] bg-white/80 p-4"
            >
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </CardPanel>
  );
}

