import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KnowledgeBaseGrid } from '@/components/knowledge-base/knowledge-base-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's knowledge bases with file counts
  const { data: knowledgeBases, error } = await supabase
    .from('knowledge_bases')
    .select(`
      *,
      files(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge bases:', error);
  }

  // Transform the data to include file_count
  const kbsWithFileCount = (knowledgeBases || []).map((kb) => ({
    ...kb,
    file_count: kb.files?.[0]?.count || 0,
    files: undefined, // Remove the nested files object
  }));

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <KnowledgeBaseGrid initialKnowledgeBases={kbsWithFileCount} userId={user.id} />
      </div>
    </div>
  );
}
