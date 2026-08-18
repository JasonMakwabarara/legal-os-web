import { isDemoMode } from "@/lib/demo-mode";
import { resetDemoState } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
      <p>
        Demo mode — seeded Rivera &amp; Hale data lives in this browser only. It is not legal advice
        and is not stored on a server.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="border-amber-500/40 text-amber-100 hover:bg-amber-500/10"
        onClick={() => {
          resetDemoState();
          window.location.reload();
        }}
      >
        Reset demo data
      </Button>
    </div>
  );
}
