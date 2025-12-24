// valeur brute → 10 chiffres max
export function parsePhone(input: string): string {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("33")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);

  return digits.slice(0, 9);
}

// affichage standard → 0X XX XX XX XX
export function formatPhone(digits: string): string {
  return digits.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ");
}

export function isValidPhone(digits: string): boolean {
  return digits.length === 9;
}
