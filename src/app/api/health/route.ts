import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        database: { status: 'unknown', message: '' },
        api: { status: 'healthy', message: 'API is responsive' },
      },
    };

    // Check database connection
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('id')
        .limit(1);

      if (error) {
        checks.checks.database = {
          status: 'unhealthy',
          message: `Database error: ${error.message}`,
        };
        checks.status = 'degraded';
      } else {
        checks.checks.database = {
          status: 'healthy',
          message: 'Database connection successful',
        };
      }
    } catch (dbError) {
      checks.checks.database = {
        status: 'unhealthy',
        message: `Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
      };
      checks.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = checks.status === 'healthy' ? 200 : 503;

    return NextResponse.json(checks, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
