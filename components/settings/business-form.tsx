"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatSiret, parseSiret } from "@/lib/format";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type UrssafMode = "monthly" | "quarterly";

function formatFrenchPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  // Supprime le 0 initial
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 9);

  const spaced = digits.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ");

  return spaced;
}

export function BusinessForm() {
  const supabase = createClient();

  const [urssafMode, setUrssafMode] = useState<UrssafMode>("monthly");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [siret, setSiret] = useState("");
  const [address, setAddress] = useState("");

  const [initialPhoneNumber, setInitialPhoneNumber] = useState("");
  const [initialSiret, setInitialSiret] = useState("");
  const [initialAddress, setInitialAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadBusinessInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const userId = user.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("declaration_mode, siret, phone, address")
        .eq("id", userId)
        .single();

      if (error) return;

      setUrssafMode(data.declaration_mode ?? "monthly");
      setInitialSiret(data.siret ?? "");
      setInitialPhoneNumber(data.phone ?? "");
      setInitialAddress(data.address ?? "");
    };

    loadBusinessInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // empêche le reload de page
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .update({
          declaration_mode: urssafMode,
          siret,
          phone: phoneNumber,
          address,
        })
        .eq("id", userId); // si tu as besoin de RLS

      setLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="w-64 flex-shrink-0">
        <h2 className="text-lg font-medium">Business information</h2>
        <p className="text-sm text-muted-foreground">
          Manage your business details and preferences.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-6 max-w-xl flex-1">
        {/* URSSAF MODE */}
        <div>
          <Label>URSSAF</Label>
          <Select
            value={urssafMode}
            onValueChange={(value) => setUrssafMode(value as UrssafMode)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Declared monthly</SelectItem>
              <SelectItem value="quarterly">Declared quarterly</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            Used to estimate your declarations.
          </p>
        </div>

        {/* SIRET */}
        <div>
          <Label>SIRET</Label>
          <Input
            className="mt-1"
            placeholder={formatSiret(initialSiret)}
            value={formatSiret(siret)}
            onChange={(e) => {
              setSiret(parseSiret(e.target.value));
            }}
          />
        </div>

        {/* PHONE */}
        <div>
          <Label>Phone number</Label>

          <div className="relative mt-1">
            {/* Drapeau */}
            <div className="pointer-events-none absolute left-0 top-0 flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">
              🇫🇷
            </div>

            {/* Faux placeholder (reste du numéro) */}
            {phoneNumber.length === 0 && (
              <div className="pointer-events-none absolute left-[5.4rem] top-1/2 -translate-y-[48%] text-sm text-muted-foreground">
                {formatFrenchPhone(initialPhoneNumber)}
              </div>
            )}

            {/* Input */}
            <Input
              className="pl-[3.5rem]"
              value={`+33 ${formatFrenchPhone(phoneNumber)}`}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, "");

                // Supprime +33 s’il est recopié
                if (raw.startsWith("33")) {
                  raw = raw.slice(2);
                }

                // Supprime le 0 initial
                if (raw.startsWith("0")) {
                  raw = raw.slice(1);
                }

                setPhoneNumber(raw);
              }}
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <Label>Business address</Label>
          <Input
            className="mt-1"
            placeholder={initialAddress}
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
    </div>
  );
}
