import { Pool, type QueryResult, type QueryResultRow } from 'pg';

// Maintain a single pool instance across hot reloads in development
let pool: Pool | null = null;

export function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Please set your Neon PostgreSQL connection string in .env');
  }

  if (!pool) {
    const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle Neon PostgreSQL client:', err);
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const p = getPool();
  return p.query<T>(text, params);
}
