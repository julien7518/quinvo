// Nettoie une valeur SIRET (input → valeur brute)
export function parseSiret(input: string): string {
  return input.replace(/\D/g, "").slice(0, 14);
}

// Formate un SIRET pour affichage
export function formatSiret(siret: string): string {
  const digits = parseSiret(siret);

  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,5})$/, (_, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(" ")
  );
}
