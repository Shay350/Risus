import { Download, Link2, Mail } from "lucide-react";

import { ActionBar } from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";

export function ExportShareBar() {
  return (
    <ActionBar
      title="Share deliverables"
      description="Mock export controls are in place for the case worker packet, client summary, and internal follow-up."
      actions={
        <>
          <Button variant="outline">
            <Link2 className="h-4 w-4" />
            Copy secure link
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4" />
            Queue email
          </Button>
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </>
      }
    />
  );
}

