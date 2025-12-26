export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatEuro(amount: unknown): string {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "- €";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
