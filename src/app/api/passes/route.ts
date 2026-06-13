import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const passes = await db.query.passes.findMany({
      where: (p, { eq }) => eq(p.actif, true),
      orderBy: (p, { asc }) => [asc(p.prix)],
    });
    return NextResponse.json(passes);
  } catch (error) {
    console.error('GET /api/passes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
