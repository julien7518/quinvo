import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function ClientTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Factures</TableHead>
          <TableHead>Total</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>ACME Studio</TableCell>
          <TableCell>contact@acme.fr</TableCell>
          <TableCell>4</TableCell>
          <TableCell>2 100 €</TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">
              Voir
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
