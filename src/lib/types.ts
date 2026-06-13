export type PassCode = 'BRONZE' | 'ARGENT' | 'OR';
export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'PAYEE' | 'ANNULEE';

export interface Pass {
  id: number;
  code: PassCode;
  label: string;
  prix: number;
  credit: number;
  actif: boolean;
}

export interface MenuVariant {
  id: number;
  itemId: number;
  label: string;
  prix: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  nom: string;
  description: string | null;
  prix: number | null;
  commandable: boolean;
  ordre: number;
  variants: MenuVariant[];
  category?: MenuCategory;
}

export interface MenuCategory {
  id: number;
  slug: string;
  nom: string;
  emoji: string;
  ordre: number;
  items: MenuItem[];
}

// Cart types (client-side)
export interface CartPassLine {
  passId: number;
  pass: Pass;
  quantite: number;
  quantiteOfferte: number; // calculé 2+1
  sousTotal: number;
}

export interface CartItemLine {
  itemId: number;
  item: MenuItem;
  variantId: number | null;
  variant: MenuVariant | null;
  quantite: number;
  quantiteOfferte: number; // calculé BOCK 2+1
  prixUnitaire: number;
  sousTotal: number;
}

export interface CartState {
  passLines: CartPassLine[];
  itemLines: CartItemLine[];
  totalPass: number;
  totalMenu: number;
  totalGeneral: number;
  creditTotal: number;
}

export interface Reservation {
  id: number;
  code: string;
  nom: string;
  telephone: string;
  statut: StatutReservation;
  totalPass: number;
  totalMenu: number;
  totalGeneral: number;
  creditTotal: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  reservationPasses?: Array<{
    id: number;
    passId: number;
    quantite: number;
    quantiteOfferte: number;
    prixUnitaire: number;
    sousTotal: number;
    pass: Pass;
  }>;
  reservationItems?: Array<{
    id: number;
    itemId: number;
    variantId: number | null;
    quantite: number;
    quantiteOfferte: number;
    prixUnitaire: number;
    sousTotal: number;
    item: MenuItem;
    variant: MenuVariant | null;
  }>;
}
