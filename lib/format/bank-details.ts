export function isValidIban(iban: string): boolean {
  // Nettoyer l'IBAN (enlever espaces)
  const cleaned = iban.replace(/\s/g, "").toUpperCase();

  // IBAN français: FR + 2 chiffres de contrôle + 23 caractères (5 chiffres banque + 5 chiffres guichet + 11 chiffres compte + 2 chiffres clé)
  if (!/^FR\d{25}$/.test(cleaned)) {
    return false;
  }

  // Vérification de la clé de contrôle (algorithme mod 97)
  const reordered = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = reordered.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  );

  // Calcul mod 97 sur de grands nombres
  let remainder = "";
  for (const digit of numeric) {
    remainder += digit;
    remainder = (parseInt(remainder) % 97).toString();
  }

  return parseInt(remainder) === 1;
}

export function formatIban(iban: string): string {
  // Nettoyer et garder seulement les chiffres
  const cleaned = iban
    .replace(/\s/g, "")
    .replace(/^FR/i, "")
    .replace(/\D/g, "");

  // Tronquer à 25 chiffres maximum
  const truncated = cleaned.slice(0, 25);

  // Ajouter FR devant et formater par groupes de 4
  const withFR = "FR" + truncated;
  return withFR.match(/.{1,4}/g)?.join(" ") || withFR;
}

export function parseIban(iban: string): string {
  return iban.replace(/\s/g, "").toUpperCase();
}

export function isValidBic(bic: string): boolean {
  const cleaned = bic.replace(/\s/g, "").toUpperCase();
  // BIC français: 4 lettres (banque) + FR + 2 caractères (localisation) + 3 caractères optionnels (agence)
  return /^[A-Z]{4}FR[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned);
}
