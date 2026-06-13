import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { reservations, reservationPasses, reservationItems, passes, menuItems, menuVariants } from '@/lib/schema';
import { generateReservationCode, calcul2Plus1, calculBock2Plus1 } from '@/lib/utils';
import { eq } from 'drizzle-orm';

const PassLineSchema = z.object({
  passId: z.number().int().positive(),
  quantite: z.number().int().min(1).max(50),
});

const ItemLineSchema = z.object({
  itemId: z.number().int().positive(),
  variantId: z.number().int().positive().nullable().optional(),
  quantite: z.number().int().min(1).max(50),
});

const ReservationSchema = z.object({
  nom: z.string().min(2).max(100).trim(),
  telephone: z
    .string()
    .regex(/^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, 'Format invalide : +225 XX XX XX XX XX'),
  passLines: z.array(PassLineSchema).min(1, 'Au moins 1 pass requis'),
  itemLines: z.array(ItemLineSchema).optional().default([]),
  note: z.string().max(500).optional(),
});

// Trouver l'ID du Bière Bock (item spécial offre 2+1)
let bockItemId: number | null = null;
async function getBockItemId(): Promise<number | null> {
  if (bockItemId !== null) return bockItemId;
  const item = await db.query.menuItems.findFirst({
    where: (i, { eq }) => eq(i.nom, 'Bière Bock'),
  });
  bockItemId = item?.id ?? null;
  return bockItemId;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nom, telephone, passLines, itemLines, note } = parsed.data;

    // Générer un code unique
    let code = generateReservationCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.query.reservations.findFirst({
        where: (r, { eq }) => eq(r.code, code),
      });
      if (!existing) break;
      code = generateReservationCode();
      attempts++;
    }

    // Calculer les totaux côté serveur
    let totalPass = 0;
    let creditTotal = 0;
    const passRows: typeof reservationPasses.$inferInsert[] = [];

    for (const line of passLines) {
      const passData = await db.query.passes.findFirst({
        where: (p, { and, eq }) => and(eq(p.id, line.passId), eq(p.actif, true)),
      });
      if (!passData) {
        return NextResponse.json({ error: `Pass ID ${line.passId} introuvable` }, { status: 400 });
      }
      const { payant, offert } = calcul2Plus1(line.quantite);
      const sousTotal = payant * passData.prix;
      totalPass += sousTotal;
      creditTotal += line.quantite * passData.credit; // crédit sur TOUS les pass y.c. offerts
      passRows.push({
        passId: line.passId,
        quantite: line.quantite,
        quantiteOfferte: offert,
        prixUnitaire: passData.prix,
        sousTotal,
      } as typeof reservationPasses.$inferInsert);
    }

    let totalMenu = 0;
    const itemRows: typeof reservationItems.$inferInsert[] = [];
    const bockId = await getBockItemId();

    for (const line of itemLines ?? []) {
      let prixUnitaire = 0;

      if (line.variantId) {
        const variant = await db.query.menuVariants.findFirst({
          where: (v, { eq }) => eq(v.id, line.variantId!),
        });
        if (!variant) {
          return NextResponse.json({ error: `Variante ID ${line.variantId} introuvable` }, { status: 400 });
        }
        prixUnitaire = variant.prix;
      } else {
        const item = await db.query.menuItems.findFirst({
          where: (i, { and, eq }) => and(eq(i.id, line.itemId), eq(i.commandable, true)),
        });
        if (!item || item.prix === null) {
          return NextResponse.json({ error: `Item ID ${line.itemId} non commandable` }, { status: 400 });
        }
        prixUnitaire = item.prix;
      }

      // Offre BOCK 2+1
      const isBock = line.itemId === bockId;
      const { payant, offert } = isBock ? calculBock2Plus1(line.quantite) : { payant: line.quantite, offert: 0 };
      const sousTotal = payant * prixUnitaire;
      totalMenu += sousTotal;
      itemRows.push({
        itemId: line.itemId,
        variantId: line.variantId ?? null,
        quantite: line.quantite,
        quantiteOfferte: offert,
        prixUnitaire,
        sousTotal,
      } as typeof reservationItems.$inferInsert);
    }

    // Le crédit pass couvre le menu — seul le dépassement est facturé en plus
    const extraMenu = Math.max(0, totalMenu - creditTotal);
    const totalGeneral = totalPass + extraMenu;

    // Insertion en transaction
    const result = await db.transaction(async (tx) => {
      const [reservation] = await tx
        .insert(reservations)
        .values({
          code,
          nom,
          telephone,
          totalPass,
          totalMenu,
          totalGeneral,
          creditTotal,
          note: note ?? null,
        })
        .returning();

      if (passRows.length > 0) {
        await tx.insert(reservationPasses).values(
          passRows.map((r) => ({ ...r, reservationId: reservation.id }))
        );
      }

      if (itemRows.length > 0) {
        await tx.insert(reservationItems).values(
          itemRows.map((r) => ({ ...r, reservationId: reservation.id }))
        );
      }

      return reservation;
    });

    return NextResponse.json({ reservation: result }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reservations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
