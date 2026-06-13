import { relations } from 'drizzle-orm';
import {
  passes,
  menuCategories,
  menuItems,
  menuVariants,
  reservations,
  reservationPasses,
  reservationItems,
} from './schema';

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, { fields: [menuItems.categoryId], references: [menuCategories.id] }),
  variants: many(menuVariants),
  reservationItems: many(reservationItems),
}));

export const menuVariantsRelations = relations(menuVariants, ({ one }) => ({
  item: one(menuItems, { fields: [menuVariants.itemId], references: [menuItems.id] }),
}));

export const passesRelations = relations(passes, ({ many }) => ({
  reservationPasses: many(reservationPasses),
}));

export const reservationsRelations = relations(reservations, ({ many }) => ({
  reservationPasses: many(reservationPasses),
  reservationItems: many(reservationItems),
}));

export const reservationPassesRelations = relations(reservationPasses, ({ one }) => ({
  reservation: one(reservations, { fields: [reservationPasses.reservationId], references: [reservations.id] }),
  pass: one(passes, { fields: [reservationPasses.passId], references: [passes.id] }),
}));

export const reservationItemsRelations = relations(reservationItems, ({ one }) => ({
  reservation: one(reservations, { fields: [reservationItems.reservationId], references: [reservations.id] }),
  item: one(menuItems, { fields: [reservationItems.itemId], references: [menuItems.id] }),
  variant: one(menuVariants, { fields: [reservationItems.variantId], references: [menuVariants.id] }),
}));
