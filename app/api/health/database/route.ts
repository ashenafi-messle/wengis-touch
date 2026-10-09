import { NextResponse } from 'next/server';
import { query } from '@/lib/neon';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as now, current_database() as database');
    return NextResponse.json({
      success: true,
      database: 'neon-postgresql',
      connected: true,
      timestamp: result.rows[0]?.now
    });
  } catch (error: any) {
    console.error('Neon database health check error:', error);
    return NextResponse.json(
      {
        success: false,
        database: 'neon-postgresql',
        connected: false,
        error: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}
