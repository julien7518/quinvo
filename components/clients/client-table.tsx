"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { ClientSheet } from "./client-sheet";
import { SearchBar } from "../search-bar";
import { NewClient } from "./new-client";
import { formatSiret } from "@/lib/format";

interface Client {
  id: string;
  company_name: string;
  siret: string;
  address?: string;
  emails: string[];
  phones: string[];
  notes: string;
}

export function ClientTable() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not found");

    if (!userId) return;

    const { data, error } = await supabase
      .from("clients")
      .select(
        `
          id,
          company_name,
          siret,
          address,
          client_emails(email),
          client_phones(phone),
          notes
        `
      )
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const formattedClients: Client[] = (data || []).map((c: any) => ({
      id: c.id,
      company_name: c.company_name,
      siret: c.siret,
      address: c.address,
      emails: c.client_emails.map((e: any) => e.email),
      phones: c.client_phones.map((e: any) => e.phone),
      notes: c.notes || "",
    }));

    setClients(formattedClients);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase();
    return (
      client.company_name.toLowerCase().includes(search) ||
      client.siret.toLowerCase().includes(search) ||
      client.emails.some((email) => email.toLowerCase().includes(search))
    );
  });

  return (
    <div>
      <div className="flex flex-row space-x-4 justify-between mb-8">
        <NewClient onClientAdded={fetchClients} />
        <SearchBar
          placeholder="Search for a client"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          resultCount={filteredClients.length}
          className="max-w-2xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Emails</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.company_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.emails.map((email) => (
                        <Badge key={email} variant="secondary">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatSiret(client.siret)}</TableCell>
                  <TableCell>
                    <ClientSheet
                      client={client}
                      onClientDeleted={fetchClients}
                      onClientUpdated={fetchClients}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClients.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              {searchTerm ? "No client found" : "Add your first clients"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
