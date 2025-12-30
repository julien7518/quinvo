"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col md:flex md:flex-row justify-between">
      <div className="w-full md:w-64 flex-shrink-0 mb-8">
        <h2 className="text-lg font-medium">Password</h2>
        <p className="text-sm text-muted-foreground">
          Update your account password.
        </p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6 max-w-xl flex-1">
        <div>
          <Label>New password</Label>
          <Input
            className="mt-1"
            type="password"
            value={password}
            placeholder="YourNewPassword123!"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <Label>Confirm password</Label>
          <Input
            className="mt-1"
            type="password"
            value={confirm}
            placeholder="YourNewPassword123!"
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Password updated</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
