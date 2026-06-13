import type { Config } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL ?? 'file:./data/amac.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url,
    ...(authToken ? { authToken } : {}),
  },
} satisfies Config;
