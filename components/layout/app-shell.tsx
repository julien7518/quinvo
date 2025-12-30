import { AppSidebar } from "./app-sidebar";
import { Separator } from "@/components/ui/separator";
import { MobileTopbar } from "./mobile-topbar";

export function AppShell({
  pageName,
  children,
}: {
  pageName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full">
        <MobileTopbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">{pageName}</h1>
            <Separator />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
