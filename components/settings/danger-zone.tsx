import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-6">
        <div>
          <p className="font-medium">Delete account</p>
          <p className="text-sm text-muted-foreground">
            This action is irreversible.
          </p>
        </div>
        <Button variant="destructive" disabled>
          Delete account
        </Button>
      </CardContent>
    </Card>
  );
}
