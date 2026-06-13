import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, reservationPasses, reservationItems, passes, menuItems } from '@/lib/schema';
import { eq, sql, desc } from 'drizzle-orm';

function checkAdminPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-admin-pin');
  return pin === (process.env.ADMIN_PIN ?? '2026');
}

export async function GET(req: NextRequest) {
  if (!checkAdminPin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Total réservations
    const [{ count: totalReservations }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations);

    // Répartition par statut
    const statutStats = await db
      .select({ statut: reservations.statut, count: sql<number>`count(*)` })
      .from(reservations)
      .groupBy(reservations.statut);

    // Pass par type
    const passStats = await db
      .select({
        code: passes.code,
        label: passes.label,
        total: sql<number>`sum(${reservationPasses.quantite})`,
        totalOfferts: sql<number>`sum(${reservationPasses.quantiteOfferte})`,
      })
      .from(reservationPasses)
      .innerJoin(passes, eq(reservationPasses.passId, passes.id))
      .groupBy(passes.id);

    // CA prévisionnel
    const [{ ca }] = await db
      .select({ ca: sql<number>`sum(total_general)` })
      .from(reservations)
      .where(sql`statut != 'ANNULEE'`);

    // Top 5 items commandés
    const topItems = await db
      .select({
        nom: menuItems.nom,
        total: sql<number>`sum(${reservationItems.quantite})`,
      })
      .from(reservationItems)
      .innerJoin(menuItems, eq(reservationItems.itemId, menuItems.id))
      .groupBy(menuItems.id)
      .orderBy(desc(sql`sum(${reservationItems.quantite})`))
      .limit(5);

    // Dernières réservations
    const latest = await db.query.reservations.findMany({
      orderBy: (r, { desc }) => [desc(r.createdAt)],
      limit: 50,
      with: {
        reservationPasses: { with: { pass: true } },
      },
    });

    return NextResponse.json({
      totalReservations,
      statutStats,
      passStats,
      ca: ca ?? 0,
      topItems,
      latest,
    });
  } catch (error) {
    console.error('GET /api/admin/stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
