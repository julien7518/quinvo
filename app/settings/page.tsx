import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { BusinessForm } from "@/components/settings/business-form";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <AppShell pageName="Settings">
      <ProfileForm />
      <Separator />
      <BusinessForm />
      <Separator />
      <PasswordForm />
      <Separator />
      <DangerZone />
    </AppShell>
  );
}
