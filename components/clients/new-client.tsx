"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  isValidEmail,
  isValidPhone,
  parsePhone,
  formatPhone,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { SiretInput } from "@/components/siret-input";
import { CompanyNameInput } from "@/components/company-input";
import { AddressInput } from "@/components/address-input";
import { useInputValidation } from "@/hooks/use-input-validation";

interface NewClientProps {
  onClientAdded?: () => void;
}

export function NewClient({ onClientAdded }: NewClientProps) {
  const supabase = createClient();

  const [newCompany, setNewCompany] = useState("");
  const [newSiret, setNewSiret] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const { errors, validateClientForm, setErrors } = useInputValidation();

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.endsWith(" ")) {
      const email = value.slice(0, -1).trim().toLowerCase();

      if (!email) return;

      if (!isValidEmail(email)) {
        setEmailInput(email);
        setIsEmailValid(false);
        return;
      }

      // ✅ Email valide
      if (!emails.includes(email)) {
        setEmails((prev) => [...prev, email]);
      }

      setEmailInput("");
      setIsEmailValid(true);
    } else {
      setEmailInput(value.toLowerCase());
      setIsEmailValid(true);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.endsWith(" ")) {
      const raw = parsePhone(value);

      if (!raw) return;

      if (!isValidPhone(raw)) {
        setPhoneInput(raw);
        setIsPhoneValid(false);
        return;
      }

      if (!phones.includes(raw)) {
        setPhones((prev) => [...prev, raw]);
      }

      setPhoneInput("");
      setIsPhoneValid(true);
    } else {
      setPhoneInput(parsePhone(value));
      setIsPhoneValid(true);
    }
  };

  const removePhone = (phoneToRemove: string) => {
    setPhones(phones.filter((p) => p !== phoneToRemove));
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleSave = async () => {
    // Build final emails list (avoid async state race)
    let finalEmails = [...emails];

    if (emailInput.trim()) {
      const email = emailInput.trim().toLowerCase();

      if (!isValidEmail(email)) {
        setIsEmailValid(false);
        return;
      }

      if (!finalEmails.includes(email)) {
        finalEmails.push(email);
      }

      setEmailInput("");
      setIsEmailValid(true);
    }

    // Build final phones list (avoid async state race)
    let finalPhones = [...phones];

    if (phoneInput.trim()) {
      const raw = parsePhone(phoneInput);

      if (!raw || !isValidPhone(raw)) {
        setIsPhoneValid(false);
        return;
      }

      if (!finalPhones.includes(raw)) {
        finalPhones.push(raw);
      }

      setPhoneInput("");
      setIsPhoneValid(true);
    }

    if (
      !validateClientForm({
        company: newCompany,
        siret: newSiret,
        address: newAddress,
      })
    )
      return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not found");

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        company_name: newCompany,
        siret: newSiret,
        address: newAddress,
        notes: newNotes,
      })
      .select()
      .single();

    if (clientError) {
      console.error(clientError);
      return;
    }

    if (finalEmails.length > 0) {
      const { error: emailError } = await supabase.from("client_emails").insert(
        finalEmails.map((email) => ({
          client_id: clientData.id,
          email,
        }))
      );
      if (emailError) console.error(emailError);
    }

    if (finalPhones.length > 0) {
      await supabase.from("client_phones").insert(
        finalPhones.map((phone) => ({
          client_id: clientData.id,
          phone,
        }))
      );
    }

    setNewCompany("");
    setNewSiret("");
    setNewAddress("");
    setEmailInput("");
    setEmails([]);

    if (onClientAdded) onClientAdded();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="max-w-2xl">+ New client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <CompanyNameInput
            value={newCompany}
            error={errors.company}
            onChange={(value) => {
              setNewCompany(value);
              setErrors((prev) => ({ ...prev, company: undefined }));
            }}
            placeholder="ACME Studio"
          />
          <SiretInput
            value={newSiret}
            onChange={setNewSiret}
            error={errors.siret}
          />
          <AddressInput
            value={newAddress}
            placeholder="12 rue de Paris, 75000, Paris, France"
            error={errors.address}
            onChange={(value) => {
              setNewAddress(value);
              setErrors((prev) => ({ ...prev, address: undefined }));
            }}
          />
          <div>
            <Label>Emails</Label>
            <Input
              value={emailInput}
              onChange={handleEmailInput}
              placeholder="Write an email and press space"
              className={cn(
                "transition-colors",
                !isEmailValid && "text-red-500 placeholder:text-red-400"
              )}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {emails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeEmail(email)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Phone numbers</Label>

            <Input
              value={phoneInput ? `0${formatPhone(phoneInput)}` : ""}
              onChange={handlePhoneInput}
              placeholder="Write a phone and press space"
              className={cn(
                "transition-colors",
                !isPhoneValid && "text-red-500 placeholder:text-red-400"
              )}
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {phones.map((phone) => (
                <Badge key={phone} variant="secondary" className="gap-1">
                  0{formatPhone(phone)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removePhone(phone)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newNotes}
              onChange={(e) => {
                setNewNotes(e.target.value);
              }}
              placeholder="Type some notes on your client"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
