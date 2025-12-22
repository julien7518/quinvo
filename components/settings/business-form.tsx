"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type UrssafMode = "monthly" | "quarterly";

export function BusinessForm() {
  const supabase = createClient();

  const [urssafMode, setUrssafMode] = useState<UrssafMode>("monthly");
  const [siret, setSiret] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadBusinessInfo = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const meta = user.user_metadata ?? {};

      setUrssafMode(meta.urssafMode ?? "monthly");
      setSiret(meta.siret ?? "");
      setAddress(meta.address ?? "");
    };

    loadBusinessInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          urssafMode,
          siret,
          address,
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business information</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
          {/* URSSAF MODE */}
          <div>
            <Label>URSSAF declaration mode</Label>
            <Select
              value={urssafMode}
              onValueChange={(value) => setUrssafMode(value as UrssafMode)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-sm text-muted-foreground">
              Used to estimate your declarations.
            </p>
          </div>

          {/* SIRET */}
          <div>
            <Label>SIRET</Label>
            <Input
              className="mt-2"
              placeholder="123 456 789 00012"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
            />
          </div>

          {/* ADDRESS */}
          <div>
            <Label>Business address</Label>
            <Input
              className="mt-2"
              placeholder="12 rue de Paris, 75000 Paris, France"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">Business information saved</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
