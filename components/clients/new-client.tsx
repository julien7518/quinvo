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
import { createClient } from "@/lib/supabase/client";

interface NewClientProps {
  onClientAdded?: () => void; // callback pour refresh la table
}

export function NewClient({ onClientAdded }: NewClientProps) {
  const supabase = createClient();

  const [newCompany, setNewCompany] = useState("");
  const [newSiret, setNewSiret] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newEmails, setNewEmails] = useState(""); // emails séparés par virgules

  const handleSave = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not found");

    // Ajouter le client
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

    // Ajouter les emails
    const emailsArray = newEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (emailsArray.length > 0) {
      const { error: emailError } = await supabase.from("client_emails").insert(
        emailsArray.map((email) => ({
          client_id: clientData.id,
          email,
        }))
      );
      if (emailError) console.error(emailError);
    }

    // Reset form
    setNewCompany("");
    setNewSiret("");
    setNewAddress("");
    setNewEmails("");

    // callback pour rafraîchir la table
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
            <Label>Emails (séparés par des virgules)</Label>
            <Input
              value={newEmails}
              onChange={(e) => setNewEmails(e.target.value)}
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
