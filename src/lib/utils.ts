// Caractères sans ambiguïté : O/0 et I/1 exclus
const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReservationCode(): string {
  let code = 'AMAC-';
  for (let i = 0; i < 4; i++) {
    code += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return code;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA'; // espace insécable
}

// Formule 2+1 : pour chaque tranche de 3, 1 est offert
// ex: 3 → payé 2, offert 1 | 6 → payé 4, offert 2 | 5 → payé 4, offert 1
export function calcul2Plus1(quantite: number): { payant: number; offert: number } {
  const offert = Math.floor(quantite / 3);
  const payant = quantite - offert;
  return { payant, offert };
}

// Formule BOCK 2+1 (identique mais nommée séparément pour clarté)
export const calculBock2Plus1 = calcul2Plus1;

export function formatTelephone(tel: string): string {
  // Normalise en +225XXXXXXXXXX
  return tel.replace(/\s+/g, '');
}

export function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
