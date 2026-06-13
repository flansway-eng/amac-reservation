import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const passes = sqliteTable('passes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // 'BRONZE' | 'ARGENT' | 'OR'
  label: text('label').notNull(),
  prix: integer('prix').notNull(),
  credit: integer('credit').notNull(),
  actif: integer('actif', { mode: 'boolean' }).notNull().default(true),
});

export const menuCategories = sqliteTable('menu_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  emoji: text('emoji').notNull(),
  ordre: integer('ordre').notNull().default(0),
});

export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => menuCategories.id),
  nom: text('nom').notNull(),
  description: text('description'),
  prix: integer('prix'), // null = prix sur place
  commandable: integer('commandable', { mode: 'boolean' }).notNull().default(true),
  ordre: integer('ordre').notNull().default(0),
});

export const menuVariants = sqliteTable('menu_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').notNull().references(() => menuItems.id),
  label: text('label').notNull(),
  prix: integer('prix').notNull(),
});

export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // 'AMAC-XXXX'
  nom: text('nom').notNull(),
  telephone: text('telephone').notNull(),
  statut: text('statut').notNull().default('EN_ATTENTE'), // 'EN_ATTENTE'|'CONFIRMEE'|'PAYEE'|'ANNULEE'
  totalPass: integer('total_pass').notNull().default(0),
  totalMenu: integer('total_menu').notNull().default(0),
  totalGeneral: integer('total_general').notNull().default(0),
  creditTotal: integer('credit_total').notNull().default(0),
  note: text('note'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const reservationPasses = sqliteTable('reservation_passes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reservationId: integer('reservation_id').notNull().references(() => reservations.id),
  passId: integer('pass_id').notNull().references(() => passes.id),
  quantite: integer('quantite').notNull(),
  quantiteOfferte: integer('quantite_offerte').notNull().default(0),
  prixUnitaire: integer('prix_unitaire').notNull(),
  sousTotal: integer('sous_total').notNull(),
});

export const reservationItems = sqliteTable('reservation_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reservationId: integer('reservation_id').notNull().references(() => reservations.id),
  itemId: integer('item_id').notNull().references(() => menuItems.id),
  variantId: integer('variant_id').references(() => menuVariants.id),
  quantite: integer('quantite').notNull(),
  quantiteOfferte: integer('quantite_offerte').notNull().default(0),
  prixUnitaire: integer('prix_unitaire').notNull(),
  sousTotal: integer('sous_total').notNull(),
});
