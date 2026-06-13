import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { reservations } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const PatchSchema = z.object({
  statut: z.enum(['EN_ATTENTE', 'CONFIRMEE', 'PAYEE', 'ANNULEE']),
  note: z.string().max(500).optional(),
});

function checkAdminPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-admin-pin');
  return pin === (process.env.ADMIN_PIN ?? '2026');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminPin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reservationId = parseInt(id, 10);
    if (isNaN(reservationId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
    }

    const updateData: Partial<typeof reservations.$inferInsert> & { updatedAt: string } = {
      statut: parsed.data.statut,
      updatedAt: new Date().toISOString(),
    };
    if (parsed.data.note !== undefined) updateData.note = parsed.data.note;

    const [updated] = await db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.id, reservationId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/admin/reservations/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
