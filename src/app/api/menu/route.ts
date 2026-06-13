import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.query.menuCategories.findMany({
      orderBy: (c, { asc }) => [asc(c.ordre)],
      with: {
        items: {
          orderBy: (i, { asc }) => [asc(i.ordre)],
          with: {
            variants: {
              orderBy: (v, { asc }) => [asc(v.id)],
            },
          },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/menu:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
