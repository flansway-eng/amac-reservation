import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations } from '@/lib/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const tel = searchParams.get('tel');

    if (!code && !tel) {
      return NextResponse.json({ error: 'Paramètre code ou tel requis' }, { status: 400 });
    }

    let reservation;

    if (code) {
      reservation = await db.query.reservations.findFirst({
        where: (r, { eq }) => eq(r.code, code.toUpperCase()),
        with: {
          reservationPasses: { with: { pass: true } },
          reservationItems: { with: { item: { with: { category: true } }, variant: true } },
        },
      });
    } else if (tel) {
      // Normalise le numéro pour la recherche
      const normalizedTel = tel.replace(/\s+/g, '');
      reservation = await db.query.reservations.findFirst({
        where: (r, { eq }) => eq(r.telephone, normalizedTel),
        with: {
          reservationPasses: { with: { pass: true } },
          reservationItems: { with: { item: { with: { category: true } }, variant: true } },
        },
        orderBy: (r, { desc }) => [desc(r.createdAt)],
      });
    }

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('GET /api/reservations/lookup:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
