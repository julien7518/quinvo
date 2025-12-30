import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCard({
  title,
  value,
  subtitle,
  isLoading = false,
}: {
  title: string;
  value?: string;
  subtitle?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {isLoading ? <Skeleton className="h-4 w-24" /> : title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-32 mb-2" />
        ) : (
          <div className="text-2xl font-semibold">{value}</div>
        )}

        {subtitle &&
          (isLoading ? (
            <Skeleton className="h-3 w-20" />
          ) : (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ))}
      </CardContent>
    </Card>
  );
}
