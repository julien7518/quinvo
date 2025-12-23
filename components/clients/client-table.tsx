"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { ClientSheet } from "./client-sheet";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { NewClient } from "./new-client";

interface Client {
  id: string;
  company_name: string;
  siret: string;
  address: string;
  emails: string[];
}

export function ClientTable() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
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
          client_emails(email)
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
        address: c.address || "",
        emails: c.client_emails.map((e: any) => e.email),
      }));

      setClients(formattedClients);
      setLoading(false);
      console.log(data);
    };

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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-row justify-between mb-8">
        <NewClient onClientAdded={() => setRefreshFlag((prev) => prev + 1)} />

        <InputGroup className="max-w-2xl">
          <InputGroupInput
            type="text"
            placeholder="Search for a client"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <Search /> {/* Icône importée de lucide-react ou autre */}
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {filteredClients.length} results
          </InputGroupAddon>
        </InputGroup>
      </div>
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
              <TableCell>{client.emails.join(", ")}</TableCell>
              <TableCell>{client.siret}</TableCell>
              <TableCell>
                <ClientSheet client={client} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredClients.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          {searchTerm ? "Aucun client trouvé" : "Add your first clients"}
        </div>
      )}
    </div>
  );
}
