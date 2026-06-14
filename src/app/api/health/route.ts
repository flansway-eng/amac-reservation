import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasTursoUrl = Boolean(process.env.TURSO_DATABASE_URL);
  const hasTursoToken = Boolean(process.env.TURSO_AUTH_TOKEN);

  if (!hasTursoUrl || !hasTursoToken) {
    return NextResponse.json({
      ok: false,
      turso_url: hasTursoUrl,
      turso_token: hasTursoToken,
      message: 'Variables manquantes',
    }, { status: 503 });
  }

  try {
    const { createDbClient } = await import('@/lib/db-client');
    const client = createDbClient();
    const result = await client.execute('SELECT COUNT(*) as c FROM passes');
    const count = Number(result.rows[0].c);
    return NextResponse.json({
      ok: true,
      turso_url: true,
      turso_token: true,
      passes_count: count,
      message: count > 0 ? 'DB opérationnelle' : 'Tables vides — relancer le seed',
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      turso_url: true,
      turso_token: true,
      error: String(err),
    }, { status: 500 });
  }
}
