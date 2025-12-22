import { ModeToggle } from "@/components/ui/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";

export function AppHeader() {
  return (
    <header className="h-14 border-b bg-background px-6 flex items-center justify-between">
      <h1 className="text-lg font-medium">Tableau de bord</h1>

      <div className="flex items-center gap-3">
        <ModeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
