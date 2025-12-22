import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { BusinessForm } from "@/components/settings/business-form";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-10">
        <h1 className="text-xl font-semibold">Settings</h1>
        <ProfileForm />
        <BusinessForm />
        <PasswordForm />
        <DangerZone />
      </div>
    </AppShell>
  );
}
