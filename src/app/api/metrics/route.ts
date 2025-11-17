import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch various metrics
    const [usersResult, kbsResult, filesResult, queriesResult] = await Promise.all([
      // Total users (via auth.users)
      supabase.auth.admin.listUsers(),

      // Total knowledge bases
      supabase
        .from('knowledge_bases')
        .select('id', { count: 'exact', head: true }),

      // Total files and storage
      supabase
        .from('files')
        .select('file_size'),

      // Total queries from usage_tracking
      supabase
        .from('usage_tracking')
        .select('total_query_count'),
    ]);

    // Calculate metrics
    const totalUsers = usersResult.data?.users?.length || 0;
    const totalKnowledgeBases = kbsResult.count || 0;
    const totalFiles = filesResult.data?.length || 0;
    const totalStorage = filesResult.data?.reduce((sum, file) => sum + ((file as any).file_size || 0), 0) || 0;
    const totalQueries = queriesResult.data?.reduce((sum, record) => sum + ((record as any).total_query_count || 0), 0) || 0;

    const metrics = {
      timestamp: new Date().toISOString(),
      application: {
        name: 'Kilo Knowledge Base',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      metrics: {
        users: {
          total: totalUsers,
          description: 'Total registered users',
        },
        knowledgeBases: {
          total: totalKnowledgeBases,
          description: 'Total knowledge bases created',
        },
        files: {
          total: totalFiles,
          totalStorage: totalStorage,
          totalStorageMB: (totalStorage / (1024 * 1024)).toFixed(2),
          description: 'Total files uploaded and storage used',
        },
        queries: {
          total: totalQueries,
          description: 'Total AI queries processed',
        },
      },
      limits: {
        knowledgeBasesPerUser: 5,
        filesPerKnowledgeBase: 10,
        fileSizeMB: 10,
        dailyQueriesPerUser: 100,
        totalStoragePerUserMB: 100,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
