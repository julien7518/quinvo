"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  isValidEmail,
  isValidPhone,
  parsePhone,
  formatPhone,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { SiretInput } from "../siret-input";
import { CompanyNameInput } from "../company-input";
import { AddressInput } from "../address-input";
import { useInputValidation } from "@/hook/useInputValidation";

interface Client {
  id: string;
  company_name: string;
  siret: string;
  address?: string;
  emails: string[];
  phones: string[];
  notes: string;
}

interface ClientSheetProps {
  client: Client;
  onClientDeleted: () => void;
  onClientUpdated?: () => void;
}

export function ClientSheet({
  client,
  onClientDeleted,
  onClientUpdated,
}: ClientSheetProps) {
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(client);
  const [emailInput, setEmailInput] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false);
  const { errors, validateClientForm, setErrors } = useInputValidation();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setFormData(client);
    setEmailInput("");
    setPhoneInput("");
    setErrors({});
    setIsEmailValid(true);
    setIsPhoneValid(true);
    setIsEditing(false);
  };

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

      if (!formData.emails.includes(email)) {
        setFormData({ ...formData, emails: [...formData.emails, email] });
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

      if (!formData.phones.includes(raw)) {
        setFormData({ ...formData, phones: [...formData.phones, raw] });
      }

      setPhoneInput("");
      setIsPhoneValid(true);
    } else {
      setPhoneInput(parsePhone(value));
      setIsPhoneValid(true);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setFormData({
      ...formData,
      emails: formData.emails.filter((email) => email !== emailToRemove),
    });
  };

  const removePhone = (phoneToRemove: string) => {
    setFormData({
      ...formData,
      phones: formData.phones.filter((p) => p !== phoneToRemove),
    });
  };

  const handleDeleteClient = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not found");

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", client.id);

    if (error) {
      console.error(error);
      return;
    }

    onClientDeleted?.();
  };

  const handleSave = async () => {
    if (
      !validateClientForm({
        company: formData.company_name,
        siret: formData.siret,
        address: formData.address,
      })
    )
      return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not found");

    // Mise à jour des infos du client
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .update({
        user_id: userId,
        company_name: formData.company_name,
        siret: formData.siret,
        address: formData.address,
        notes: formData.notes,
      })
      .eq("id", client.id)
      .select()
      .single();

    if (clientError) {
      console.error(clientError);
      return;
    }

    // Gestion des emails
    const emailsToDelete = client.emails.filter(
      (email) => !formData.emails.includes(email)
    );
    const emailsToAdd = formData.emails.filter(
      (email) => !client.emails.includes(email)
    );

    if (emailsToDelete.length > 0) {
      await supabase
        .from("client_emails")
        .delete()
        .eq("client_id", client.id)
        .in("email", emailsToDelete);
    }

    if (emailsToAdd.length > 0) {
      await supabase.from("client_emails").insert(
        emailsToAdd.map((email) => ({
          client_id: client.id,
          email,
        }))
      );
    }

    // Gestion des phones
    const phonesToDelete = client.phones.filter(
      (phone) => !formData.phones.includes(phone)
    );
    const phonesToAdd = formData.phones.filter(
      (phone) => !client.phones.includes(phone)
    );

    if (phonesToDelete.length > 0) {
      await supabase
        .from("client_phones")
        .delete()
        .eq("client_id", client.id)
        .in("phone", phonesToDelete);
    }

    if (phonesToAdd.length > 0) {
      await supabase.from("client_phones").insert(
        phonesToAdd.map((phone) => ({
          client_id: client.id,
          phone,
        }))
      );
    }

    setIsEditing(false);
    setHasBeenUpdated(true);
  };

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open && hasBeenUpdated) {
          onClientUpdated?.();
          setHasBeenUpdated(false);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          More
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full p-4 sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Client Details</SheetTitle>
          <SheetDescription>
            View and edit your client informations
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-4">
          <CompanyNameInput
            id="company_name"
            value={formData.company_name}
            disabled={!isEditing}
            error={errors.company}
            onChange={(value) => {
              setFormData({ ...formData, company_name: value });
              setErrors((prev) => ({ ...prev, company: undefined }));
            }}
          />
          <SiretInput
            id="siret"
            value={formData.siret}
            disabled={!isEditing}
            error={errors.siret}
            onChange={(value) => {
              setFormData({
                ...formData,
                siret: value,
              });
              setErrors((prev) => ({ ...prev, siret: undefined }));
            }}
          />

          <AddressInput
            id="address"
            value={formData.address || ""}
            disabled={!isEditing}
            placeholder="123 Rue de Paris, 75001 Paris"
            error={errors.address}
            onChange={(value) => {
              setFormData({ ...formData, address: value });
              setErrors((prev) => ({ ...prev, address: undefined }));
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="emails">Emails</Label>
            {isEditing && (
              <Input
                id="emails"
                value={emailInput}
                onChange={handleEmailInput}
                placeholder="Write an email and press space"
                className={cn(
                  "transition-colors",
                  !isEmailValid && "text-red-500 placeholder:text-red-400"
                )}
              />
            )}
            <div className="flex flex-wrap gap-2">
              {formData.emails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  {isEditing && (
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeEmail(email)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phones">Phones</Label>
            {isEditing && (
              <Input
                id="phones"
                value={phoneInput ? `0${formatPhone(phoneInput)}` : ""}
                onChange={handlePhoneInput}
                placeholder="Write a phone and press space"
                className={cn(
                  "transition-colors",
                  !isPhoneValid && "text-red-500 placeholder:text-red-400"
                )}
              />
            )}
            <div className="flex flex-wrap gap-2">
              {formData.phones.map((phone) => (
                <Badge key={phone} variant="secondary" className="gap-1">
                  0{formatPhone(phone)}
                  {isEditing && (
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removePhone(phone)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
        </div>

        <SheetFooter className="gap-2 p-0">
          {!isEditing ? (
            <div className="flex space-x-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is irreversible. All phone numbers and emails
                      linked to this client will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleDeleteClient}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleEdit} className="flex-1">
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handleDiscard}
                variant="secondary"
                className="flex-1"
              >
                Discard
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
