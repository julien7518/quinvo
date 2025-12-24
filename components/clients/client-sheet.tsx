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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  formatSiret,
  isValidEmail,
  isValidPhone,
  parseSiret,
  parsePhone,
  formatPhone,
} from "@/lib/format";
import { cn } from "@/lib/utils";

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
}

export function ClientSheet({ client }: ClientSheetProps) {
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(client);
  const [emailInput, setEmailInput] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [errors, setErrors] = useState<{
    company?: string;
    siret?: string;
    address?: string;
  }>({});

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

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.company_name.trim()) {
      newErrors.company = "Company name is required";
    }

    if (formData.siret.length !== 14) {
      newErrors.siret = "SIRET must contain exactly 14 digits";
    }

    if (!formData.address?.trim()) {
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
    setIsEditing(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full p-4 sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Client Details</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          View and edit your client informations
        </SheetDescription>

        <div className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => {
                setFormData({ ...formData, company_name: e.target.value });
                setErrors((prev) => ({ ...prev, company: undefined }));
              }}
              disabled={!isEditing}
              className={errors.company && "border-red-500"}
            />
            {errors.company && (
              <p className="text-sm text-red-500 mt-1">{errors.company}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              value={formatSiret(formData.siret)}
              onChange={(e) => {
                setFormData({ ...formData, siret: parseSiret(e.target.value) });
                setErrors((prev) => ({ ...prev, siret: undefined }));
              }}
              disabled={!isEditing}
              className={errors.siret && "border-red-500"}
            />
            {errors.siret && (
              <p className="text-sm text-red-500 mt-1">{errors.siret}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              disabled={!isEditing}
              className={errors.address && "border-red-500"}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emails">Emails</Label>
            <Input
              id="emails"
              value={formData.emails.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emails: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phones">Phones</Label>
            <Input
              id="phones"
              value={formData.phones.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phones: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              disabled
            />
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
              rows={4}
            />
          </div>
        </div>

        <SheetFooter className="gap-2 p-0">
          {!isEditing ? (
            <Button onClick={handleEdit} className="w-full">
              Edit
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={handleDiscard}
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
