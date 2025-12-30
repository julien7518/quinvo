import { Button } from "@/components/ui/button";

export function DangerZone() {
  return (
    <div className="flex-col md:flex md:flex-row justify-between">
      <div className="w-full md:w-64 flex-shrink-0 mb-8">
        <h2 className="text-lg font-medium text-red-500">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          Manage sensitive account actions.
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 p-4 border border-red-500 rounded-lg max-w-xl flex-1">
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
