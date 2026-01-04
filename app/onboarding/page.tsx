"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatPhone,
  parsePhone,
  formatIban,
  parseIban,
  isValidIban,
  isValidBic,
} from "@/lib/format";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import { SiretInput } from "@/components/siret-input";
import { AddressInput } from "@/components/address-input";
import { useInputValidation } from "@/hooks/use-input-validation";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type UrssafMode = "monthly" | "quarterly";

export default function OnBoarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 – Identity
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Step 2 – Company / Legal
  const [siret, setSiret] = useState("");
  const [urssafMode, setUrssafMode] = useState<UrssafMode>("monthly");

  // Step 3 – Contact
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Step 4 – Bank
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");

  const { errors, validateClientForm, setErrors } = useInputValidation();

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async () => {
    if (loading) return;

    // CONTINUE (steps 1 → 3)
    if (step < 4) {
      let isValid = true;

      if (step === 1) {
        const newErrors: any = {};

        if (firstName.trim().length < 2) {
          newErrors.firstName = "First name must contain at least 2 characters";
        }

        if (lastName.trim().length < 2) {
          newErrors.lastName = "Last name must contain at least 2 characters";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          isValid = false;
        }
      }

      if (step === 2) {
        isValid = validateClientForm({ siret });
      }

      if (step === 3) {
        isValid = validateClientForm({ address, phone });
      }

      if (isValid) {
        setErrors({});
        setStep((s) => s + 1);
      }

      return;
    }

    // FINISH ONBOARDING (step 4)
    let isValid = true;
    const newErrors: any = {};

    if (!isValidIban(iban)) {
      newErrors.iban = "Please enter a valid IBAN";
      isValid = false;
    }

    if (!isValidBic(bic)) {
      newErrors.bic = "Please enter a valid BIC";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        address,
        siret,
        declaration_mode: urssafMode,
        phone,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      setLoading(false);
      return;
    }

    const { error: bankError } = await supabase
      .from("user_bank_details")
      .upsert(
        {
          user_id: user.id,
          iban,
          bic,
        },
        { onConflict: "user_id" }
      );

    setLoading(false);

    if (!bankError) {
      router.push("/");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to Quinvo</CardTitle>
          <CardDescription>
            Let’s set up your account. This will only take a few minutes and
            will help us generate compliant invoices for you.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") {
                const target = e.target as HTMLElement;

                // Allow Enter in multiline fields
                if (target.tagName === "TEXTAREA") return;

                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>First name</Label>
                    <Input
                      className={cn(
                        "mt-1",
                        (errors as any).firstName ? "border-red-500" : ""
                      )}
                      placeholder="Jean"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {(errors as any).firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {(errors as any).firstName}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label>Last name</Label>
                    <Input
                      className={cn(
                        "mt-1",
                        (errors as any).lastName ? "border-red-500" : ""
                      )}
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {(errors as any).lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {(errors as any).lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <SiretInput
                    value={siret}
                    error={errors.siret}
                    onChange={setSiret}
                  />
                </div>

                <div>
                  <Label>URSSAF declaration frequency</Label>
                  <ToggleGroup
                    type="single"
                    value={urssafMode}
                    onValueChange={(v) => v && setUrssafMode(v as UrssafMode)}
                    className="mt-2"
                  >
                    <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
                    <ToggleGroupItem value="quarterly">
                      Quarterly
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <AddressInput
                  value={address}
                  placeholder="12 rue de Paris, 75000, Paris, France"
                  error={errors.address}
                  onChange={(value) => {
                    setAddress(value);
                  }}
                />
                <div>
                  <Label>Phone</Label>
                  <Input
                    className={cn("mt-1", errors.phone ? "border-red-500" : "")}
                    placeholder="+33 6 12 34 56 78"
                    value={phone ? `+33 ${formatPhone(phone)}` : ""}
                    onChange={(e) => setPhone(parsePhone(e.target.value))}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>IBAN</Label>
                  <Input
                    className={cn(
                      "mt-1",
                      (errors as any).iban ? "border-red-500" : ""
                    )}
                    placeholder="FR76 3000 6000 0112 3456 7890 189"
                    value={iban ? formatIban(iban) : ""}
                    onChange={(e) => setIban(parseIban(e.target.value))}
                  />
                  {(errors as any).iban && (
                    <p className="text-sm text-destructive mt-1">
                      {(errors as any).iban}
                    </p>
                  )}
                </div>

                <div>
                  <Label>BIC</Label>
                  <Input
                    className={cn(
                      "mt-1",
                      (errors as any).bic ? "border-red-500" : ""
                    )}
                    placeholder="AGRIFRPP"
                    value={bic}
                    onChange={(e) => setBic(e.target.value.toUpperCase())}
                  />
                  {(errors as any).bic && (
                    <p className="text-sm text-destructive mt-1">
                      {(errors as any).bic}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* NAVIGATION */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => {
                  setErrors({});
                  setStep((s) => s - 1);
                }}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button type="submit">Continue</Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading && (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  )}
                  {loading ? "Saving..." : "Finish"}
                </Button>
              )}
            </div>
            <div className="px-6 pt-6">
              <Progress value={(step / 4) * 100} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
