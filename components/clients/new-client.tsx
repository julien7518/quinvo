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
  formatSiret,
  isValidEmail,
  isValidPhone,
  parseSiret,
  parsePhone,
  formatPhone,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";

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
  const [errors, setErrors] = useState<{
    company?: string;
    siret?: string;
    address?: string;
  }>({});

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

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!newCompany.trim()) {
      newErrors.company = "Company name is required";
    }

    if (newSiret.length !== 14) {
      newErrors.siret = "SIRET must contain exactly 14 digits";
    }

    if (!newAddress.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

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

    if (emails.length > 0) {
      const { error: emailError } = await supabase.from("client_emails").insert(
        emails.map((email) => ({
          client_id: clientData.id,
          email,
        }))
      );
      if (emailError) console.error(emailError);
    }

    if (phones.length > 0) {
      await supabase.from("client_phones").insert(
        phones.map((phone) => ({
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
        <Button>+ New client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Company name</Label>
            <Input
              value={newCompany}
              onChange={(e) => {
                setNewCompany(e.target.value);
                setErrors((prev) => ({ ...prev, company: undefined }));
              }}
              placeholder="ACME Studio"
              className={errors.company && "border-red-500"}
            />
            {errors.company && (
              <p className="text-sm text-red-500 mt-1">{errors.company}</p>
            )}
          </div>
          <div>
            <Label>SIRET</Label>
            <Input
              value={formatSiret(newSiret)}
              onChange={(e) => {
                setNewSiret(parseSiret(e.target.value));
                setErrors((prev) => ({ ...prev, siret: undefined }));
              }}
              placeholder={formatSiret("12345678912345")}
              className={errors.siret && "border-red-500"}
            />
            {errors.siret && (
              <p className="text-sm text-red-500 mt-1">{errors.siret}</p>
            )}
          </div>
          <div>
            <Label>Adress</Label>
            <Input
              value={newAddress}
              onChange={(e) => {
                setNewAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              placeholder="12 rue de Paris, 75000, Paris, France"
              className={errors.address && "border-red-500"}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>
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
              placeholder="06 12 34 56 78"
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
