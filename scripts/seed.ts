import { createDbClient } from '../src/lib/db-client';

const db = createDbClient();

async function main() {
  // Création des tables
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      prix INTEGER NOT NULL,
      credit INTEGER NOT NULL,
      actif INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      nom TEXT NOT NULL,
      emoji TEXT NOT NULL,
      ordre INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES menu_categories(id),
      nom TEXT NOT NULL,
      description TEXT,
      prix INTEGER,
      commandable INTEGER NOT NULL DEFAULT 1,
      ordre INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS menu_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES menu_items(id),
      label TEXT NOT NULL,
      prix INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      nom TEXT NOT NULL,
      telephone TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'EN_ATTENTE',
      total_pass INTEGER NOT NULL DEFAULT 0,
      total_menu INTEGER NOT NULL DEFAULT 0,
      total_general INTEGER NOT NULL DEFAULT 0,
      credit_total INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reservation_passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id),
      pass_id INTEGER NOT NULL REFERENCES passes(id),
      quantite INTEGER NOT NULL,
      quantite_offerte INTEGER NOT NULL DEFAULT 0,
      prix_unitaire INTEGER NOT NULL,
      sous_total INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id),
      item_id INTEGER NOT NULL REFERENCES menu_items(id),
      variant_id INTEGER REFERENCES menu_variants(id),
      quantite INTEGER NOT NULL,
      quantite_offerte INTEGER NOT NULL DEFAULT 0,
      prix_unitaire INTEGER NOT NULL,
      sous_total INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_code ON reservations(code);
    CREATE INDEX IF NOT EXISTS idx_reservations_tel ON reservations(telephone);
  `);

  // Vider les données (idempotent)
  await db.executeMultiple(`
    DELETE FROM reservation_items;
    DELETE FROM reservation_passes;
    DELETE FROM reservations;
    DELETE FROM menu_variants;
    DELETE FROM menu_items;
    DELETE FROM menu_categories;
    DELETE FROM passes;
  `);

  // ─── PASS ─────────────────────────────────────────────────────────────────
  await db.executeMultiple(`
    INSERT INTO passes (code, label, prix, credit) VALUES ('BRONZE', 'Pass Bronze', 5000, 5000);
    INSERT INTO passes (code, label, prix, credit) VALUES ('ARGENT', 'Pass Argent', 10000, 10000);
    INSERT INTO passes (code, label, prix, credit) VALUES ('OR', 'Pass Or', 15000, 15000);
  `);

  // ─── CATÉGORIES ──────────────────────────────────────────────────────────
  await db.executeMultiple(`
    INSERT INTO menu_categories (slug, nom, emoji, ordre) VALUES ('saucisses', 'Les Saucisses', '🌭', 1);
    INSERT INTO menu_categories (slug, nom, emoji, ordre) VALUES ('brochettes', 'Les Brochettes', '🍢', 2);
    INSERT INTO menu_categories (slug, nom, emoji, ordre) VALUES ('autres', 'Autres', '🍖', 3);
    INSERT INTO menu_categories (slug, nom, emoji, ordre) VALUES ('accompagnements', 'Les Accompagnements', '🍟', 4);
    INSERT INTO menu_categories (slug, nom, emoji, ordre) VALUES ('desserts', 'Desserts', '🍰', 5);
    INSERT INTO menu_categories (slug, nom, emoji, ordre) VALUES ('boissons', 'Boissons', '🥤', 6);
  `);

  // Helper : insérer item + variantes
  async function addItem(
    catSlug: string,
    nom: string,
    description: string | null,
    prix: number | null,
    commandable: boolean,
    ordre: number,
    variants?: Array<{ label: string; prix: number }>
  ) {
    const catRes = await db.execute({
      sql: 'SELECT id FROM menu_categories WHERE slug = ?',
      args: [catSlug],
    });
    const catId = catRes.rows[0].id as number;

    const itemRes = await db.execute({
      sql: 'INSERT INTO menu_items (category_id, nom, description, prix, commandable, ordre) VALUES (?, ?, ?, ?, ?, ?)',
      args: [catId, nom, description, prix, commandable ? 1 : 0, ordre],
    });
    const itemId = Number(itemRes.lastInsertRowid);

    if (variants) {
      for (const v of variants) {
        await db.execute({
          sql: 'INSERT INTO menu_variants (item_id, label, prix) VALUES (?, ?, ?)',
          args: [itemId, v.label, v.prix],
        });
      }
    }
  }

  // ─── SAUCISSES ────────────────────────────────────────────────────────────
  await addItem('saucisses', 'Saucisses de volaille grillées', null, null, true, 1, [
    { label: '2 pièces', prix: 3000 },
    { label: '3 pièces', prix: 4000 },
  ]);
  await addItem('saucisses', 'Saucisses de bœuf grillées', null, null, true, 2, [
    { label: '2 pièces', prix: 3000 },
    { label: '3 pièces', prix: 4000 },
  ]);

  // ─── BROCHETTES ───────────────────────────────────────────────────────────
  await addItem('brochettes', 'Brochette de filet de bœuf', '2 pièces', 4000, true, 1);
  await addItem('brochettes', 'Brochette de filet de mérou', '2 pièces', 5000, true, 2);
  await addItem('brochettes', 'Brochette mixte gambas & mérou', '2 pièces', 8000, true, 3);
  await addItem('brochettes', 'Brochette de poulet', '2 pièces', 3000, true, 4);

  // ─── AUTRES ───────────────────────────────────────────────────────────────
  await addItem('autres', 'Côte de porc braisée', '2 pièces', 3000, true, 1);
  await addItem('autres', 'Gésiers de volaille', '2 pièces', 4000, true, 2);

  // ─── ACCOMPAGNEMENTS ──────────────────────────────────────────────────────
  await addItem('accompagnements', 'Aloco', null, 1000, true, 1);
  await addItem('accompagnements', 'Frites de pommes de terre', null, 1500, true, 2);
  await addItem('accompagnements', 'Attiéké', null, 1000, true, 3);

  // ─── DESSERTS ─────────────────────────────────────────────────────────────
  await addItem('desserts', 'Assiette de fromage', null, 5000, true, 1);
  await addItem('desserts', 'Assiette de fruit', null, 2000, true, 2);
  await addItem('desserts', 'Pâtisseries du jour', null, 3000, true, 3);

  // ─── BOISSONS ─────────────────────────────────────────────────────────────
  await addItem('boissons', 'Soft drinks', null, null, true, 1, [
    { label: 'Sprite', prix: 1500 },
    { label: 'Schweppes', prix: 1500 },
    { label: 'Fanta', prix: 1500 },
    { label: 'Moka café', prix: 1500 },
    { label: 'Youki orange', prix: 1500 },
  ]);
  await addItem('boissons', 'Sodas premium', null, null, true, 2, [
    { label: 'Coca-Cola', prix: 1000 },
    { label: 'Coca Zéro', prix: 1000 },
    { label: 'Perrier', prix: 1000 },
    { label: "Cody's", prix: 1000 },
    { label: 'Orangina', prix: 1000 },
  ]);
  await addItem('boissons', 'Bière Bock', 'Offre partenaire Solibra — 2+1 offerte !', 1500, true, 3);
  await addItem('boissons', 'Bières (autres)', null, null, true, 4, [
    { label: 'Dopel', prix: 1500 },
    { label: 'Castel', prix: 1500 },
    { label: 'Téquila', prix: 1500 },
    { label: 'Malta', prix: 1500 },
    { label: 'Ivoire Black', prix: 1500 },
    { label: 'Beaufort', prix: 1500 },
    { label: 'Desperados', prix: 1500 },
    { label: 'Guinness', prix: 1500 },
  ]);
  await addItem('boissons', 'Jus', null, null, true, 5, [
    { label: 'Citron', prix: 1000 },
    { label: 'Bissap', prix: 1000 },
    { label: 'Gnamankoudji', prix: 1000 },
    { label: 'Tommy', prix: 1000 },
    { label: 'Orange nature', prix: 1000 },
    { label: 'Jus cocktail (brique)', prix: 1000 },
    { label: 'Jus orange (brique)', prix: 1000 },
    { label: 'Jus goyave (brique)', prix: 1000 },
    { label: 'Jus ananas (brique)', prix: 1000 },
  ]);
  await addItem('boissons', 'Eau', null, null, true, 6, [
    { label: 'Céleste 1/2 litre', prix: 1000 },
    { label: 'Céleste 1,5 litre', prix: 1500 },
    { label: 'Kirène 1 litre', prix: 2000 },
  ]);
  await addItem('boissons', 'Vins', 'Large sélection disponible — prix sur place', null, false, 7);
  await addItem('boissons', 'Cocktails avec ou sans alcool', 'Prix sur place', null, false, 8);

  const itemCount = await db.execute('SELECT COUNT(*) as c FROM menu_items');
  const varCount = await db.execute('SELECT COUNT(*) as c FROM menu_variants');
  console.log(
    `✅ Seed terminé : 3 pass, 6 catégories, ${itemCount.rows[0].c} items, ${varCount.rows[0].c} variantes`
  );
}

main().catch((e) => {
  console.error('❌ Erreur seed:', e);
  process.exit(1);
});
