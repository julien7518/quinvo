"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KpiCard } from "./kpi-card";
import { formatEuro } from "@/lib/format";

interface Invoice {
  id: string;
  status: string;
  total_amount: number;
  issue_date: string;
}

export function KpiLayout() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [toDeclare, setToDeclare] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      // 1️⃣ Récupérer le mode de déclaration
      const { data: profile } = await supabase
        .from("profiles")
        .select("declaration_mode")
        .eq("id", userId)
        .single();

      const declarationMode = profile?.declaration_mode || "monthly"; // fallback

      // 2️⃣ Récupérer les factures
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id, status, invoice_items ( quantity, unit_price ), issue_date"
        );

      if (error) {
        console.error(error);
        return;
      }

      const invoices: Invoice[] = data.map((invoice: any) => ({
        id: invoice.id,
        status: invoice.status,
        issue_date: invoice.issue_date,
        total_amount: invoice.invoice_items.reduce(
          (acc: number, item: any) => acc + item.quantity * item.unit_price,
          0
        ),
      }));

      // Total revenue = toutes les factures paid
      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      // Pending = sent ou overdue
      const pendingInvoices = invoices.filter(
        (inv) => inv.status === "sent" || inv.status === "overdue"
      );

      const pendingAmount = pendingInvoices.reduce(
        (sum, inv) => sum + inv.total_amount,
        0
      );

      const pendingCount = pendingInvoices.length;

      // To Declare = toutes les factures émises (sent, paid ou overdue) selon le declaration_mode
      const now = new Date();
      let startDate: Date;

      if (declarationMode === "monthly") {
        // Depuis le 1er du mois en cours
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        // Depuis le début du trimestre en cours
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      }

      const toDeclareAmount = invoices
        .filter(
          (inv) =>
            (inv.status === "paid" ||
              inv.status === "sent" ||
              inv.status === "overdue") &&
            new Date(inv.issue_date) >= startDate
        )
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      setTotalRevenue(totalRevenue);
      setPendingCount(pendingCount);
      setPendingAmount(pendingAmount);
      setToDeclare(toDeclareAmount);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <KpiCard
        title="Incoming Revenue"
        value={formatEuro(pendingAmount)}
        isLoading={loading}
      />
      <KpiCard
        title="To Declare"
        value={toDeclare !== null ? formatEuro(toDeclare) : "-€"}
        isLoading={loading}
      />
      <KpiCard
        title="Outstanding Invoices"
        value={pendingCount?.toString() || "-"}
        isLoading={loading}
      />
      <KpiCard
        title="Total Revenue"
        value={formatEuro(totalRevenue)}
        isLoading={loading}
      />
    </div>
  );
}
