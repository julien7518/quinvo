import { Button } from "@/components/ui/button";

export function DangerZone() {
  return (
    <div className="flex justify-between">
      <div className="w-64 flex-shrink-0">
        <h2 className="text-lg font-medium text-red-600">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          Manage sensitive account actions.
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 p-4 border border-red-200 rounded-lg max-w-xl flex-1">
        <div>
          <p className="font-medium">Delete account</p>
          <p className="text-sm text-muted-foreground">
            This action is irreversible.
          </p>
        </div>
        <Button variant="destructive" disabled>
          Delete account
        </Button>
      </div>
    </div>
  );
}
