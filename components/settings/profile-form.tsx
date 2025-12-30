"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProfileForm() {
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [initialFirstName, setInitialFirstName] = useState("");
  const [initialLastName, setInitialLastName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const userId = user.id; // ID du user courant

      // 1️⃣ Charger l'email depuis auth
      setInitialEmail(user.email ?? "");

      // 2️⃣ Charger le firstName / lastName depuis profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userId) // <- essentiel pour RLS
        .single();

      if (profileError) return;

      setInitialEmail(user.email ?? "");
      setEmail("");

      setInitialFirstName(profileData?.first_name ?? "");
      setInitialLastName(profileData?.last_name ?? "");

      setFirstName("");
      setLastName("");
    };

    loadUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("User not found");

      if (email && email !== initialEmail) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }

      const profileUpdates: Record<string, string> = {};

      if (firstName && firstName !== initialFirstName) {
        profileUpdates.first_name = firstName;
      }

      if (lastName && lastName !== initialLastName) {
        profileUpdates.last_name = lastName;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdates)
          .eq("id", userId);

        if (error) throw error;

        if (profileError) throw profileError;

        setSuccess(true);

        if (email && email !== initialEmail) {
          setInitialEmail(email);
        }
        if (firstName && firstName !== initialFirstName) {
          setInitialFirstName(firstName);
        }
        if (lastName && lastName !== initialLastName) {
          setInitialLastName(lastName);
        }

        setEmail("");
        setFirstName("");
        setLastName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col md:flex md:flex-row justify-between">
      <div className="w-64 flex-shrink-0 mb-8">
        <h2 className="text-lg font-medium">Personal information</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-6 max-w-xl flex-1">
        <div className="flex gap-4">
          <div>
            <Label>First name</Label>
            <Input
              className="mt-1"
              value={firstName}
              placeholder={initialFirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label>Last name</Label>
            <Input
              className="mt-1"
              value={lastName}
              placeholder={initialLastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input
            className="mt-1"
            type="email"
            value={email}
            placeholder={initialEmail}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Saved successfully</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
