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

interface NewClientProps {
  onClientAdded?: () => void;
}

export function NewClient({ onClientAdded }: NewClientProps) {
  const supabase = createClient();

  const [newCompany, setNewCompany] = useState("");
  const [newSiret, setNewSiret] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.endsWith(" ")) {
      const email = value.slice(0, -1).trim();
      if (email && !emails.includes(email)) {
        setEmails([...emails, email]);
      }
      setEmailInput("");
    } else {
      setEmailInput(value);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleSave = async () => {
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
            <Label>Nom de l'entreprise</Label>
            <Input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
          </div>
          <div>
            <Label>SIRET</Label>
            <Input
              value={newSiret}
              onChange={(e) => setNewSiret(e.target.value)}
            />
          </div>
          <div>
            <Label>Adresse</Label>
            <Input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>Emails</Label>
            <Input
              value={emailInput}
              onChange={handleEmailInput}
              placeholder="Write an email and press space"
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
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
