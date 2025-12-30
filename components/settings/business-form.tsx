"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { SiretInput } from "../siret-input";
import { useInputValidation, ClientErrors } from "@/hooks/useInputValidation";
import { cn } from "@/lib/utils";
import { formatSiret } from "@/lib/format";
import { PostgrestError } from "@supabase/supabase-js";

type UrssafMode = "monthly" | "quarterly";

function formatFrenchPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 9);

  return digits.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ");
}

export function BusinessForm() {
  const supabase = createClient();

  const ibanRef = useRef<HTMLInputElement>(null);
  const bicRef = useRef<HTMLInputElement>(null);

  // Editable (temp)
  const [urssafMode, setUrssafMode] = useState<UrssafMode>("monthly");
  const [siret, setSiret] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Persisted (placeholders)
  const [initialSiret, setInitialSiret] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [initialAddress, setInitialAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { errors, validateClientForm } = useInputValidation();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("declaration_mode, siret, phone, address")
        .eq("id", user.id)
        .single();

      if (!data) return;

      setUrssafMode(data.declaration_mode ?? "monthly");
      setInitialSiret(data.siret ?? "");
      setInitialPhone(data.phone ?? "");
      setInitialAddress(data.address ?? "");

      // inputs toujours vides
      setSiret("");
      setPhone("");
      setAddress("");
    };

    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const toValidate: Partial<ClientErrors> = {};
    if (siret.trim()) toValidate.siret = siret;
    if (phone.trim()) toValidate.phone = phone;

    if (Object.keys(toValidate).length && !validateClientForm(toValidate)) {
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const iban = ibanRef.current?.value;
      const bic = bicRef.current?.value;

      const updates: Record<string, any> = {};
      const bankUpdates: Record<string, string> = {};

      if (urssafMode) updates.declaration_mode = urssafMode;
      if (siret && siret !== initialSiret) updates.siret = siret;
      if (phone && phone !== initialPhone) updates.phone = phone;
      if (address && address !== initialAddress) updates.address = address;
      if (iban) bankUpdates.iban = iban;
      if (bic) bankUpdates.bic = bic;

      if (!Object.keys(updates).length) {
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (!Object.keys(bankUpdates).length) {
        setLoading(false);
        return;
      }

      const { error: bankError } = await supabase
        .from("user_bank_details")
        .update(bankUpdates)
        .eq("user_id", user.id);

      if (bankError) throw bankError;

      // ✅ update placeholders
      if (updates.siret) setInitialSiret(siret);
      if (updates.phone) setInitialPhone(phone);
      if (updates.address) setInitialAddress(address);

      // ✅ reset inputs
      setSiret("");
      setPhone("");
      setAddress("");
      if (ibanRef.current) ibanRef.current.value = "";
      if (bicRef.current) bicRef.current.value = "";

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof PostgrestError ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col md:flex md:flex-row justify-between">
      <div className="w-full md:w-64 flex-shrink-0 mb-8">
        <h2 className="text-lg font-medium">Business information</h2>
        <p className="text-sm text-muted-foreground">
          Manage your business details and preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl flex-1">
        {/* URSSAF */}
        <div>
          <Label>URSSAF</Label>
          <Select
            value={urssafMode}
            onValueChange={(v) => setUrssafMode(v as UrssafMode)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Declared monthly</SelectItem>
              <SelectItem value="quarterly">Declared quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SIRET */}
        <SiretInput
          value={siret}
          placeholder={formatSiret(initialSiret)}
          error={errors.siret}
          onChange={setSiret}
        />

        {/* PHONE */}
        <div>
          <Label>Phone number</Label>

          <div className="relative mt-1">
            <div className="pointer-events-none absolute left-0 top-0 flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">
              🇫🇷
            </div>

            {phone === "" && (
              <div className="pointer-events-none absolute left-[5.15rem] md:left-[4.9rem] text-base top-1/2 -translate-y-1/2 text-sm text-muted-foreground md:text-sm">
                {formatFrenchPhone(initialPhone)}
              </div>
            )}

            <Input
              className={cn("pl-[3rem]", errors.phone && "border-red-500")}
              value={`+33 ${formatFrenchPhone(phone)}`}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, "");
                if (raw.startsWith("33")) raw = raw.slice(2);
                if (raw.startsWith("0")) raw = raw.slice(1);
                setPhone(raw);
              }}
            />
          </div>

          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* ADDRESS */}
        <div>
          <Label>Business address</Label>
          <Input
            className="mt-1"
            value={address}
            placeholder={initialAddress}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div>
            <Label>IBAN</Label>
            <Input
              ref={ibanRef}
              className="mt-1"
              placeholder="FR00 1234 5678 9123 4567 8912 345"
            />
          </div>
          <div>
            <Label>BIC</Label>
            <Input ref={bicRef} className="mt-1" placeholder="BANKFR00" />
          </div>
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
