"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface Client {
  id: string;
  company_name: string;
  siret: string;
  address?: string;
  emails: string[];
}

interface ClientSheetProps {
  client: Client;
}

export function ClientSheet({ client }: ClientSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        {" "}
        {/* side peut être 'right', 'left', 'top', 'bottom' */}
        <SheetHeader>
          <SheetTitle>Client details</SheetTitle>
        </SheetHeader>
        <div className="space-y-2 mt-2">
          <div>
            <strong>Company Name:</strong> {client.company_name}
          </div>
          <div>
            <strong>SIRET:</strong> {client.siret}
          </div>
          {client.address && (
            <div>
              <strong>Address:</strong> {client.address}
            </div>
          )}
          {client.emails.length > 0 && (
            <div>
              <strong>Emails:</strong>
              <ul className="list-disc ml-6">
                {client.emails.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <SheetFooter>
          <Button disabled>Edit</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
