import { drizzle } from 'drizzle-orm/libsql';
import { createDbClient } from './db-client';
import * as schema from './schema';
import * as relations from './relations';

const client = createDbClient();

export const db = drizzle(client, { schema: { ...schema, ...relations } });

export type DB = typeof db;
