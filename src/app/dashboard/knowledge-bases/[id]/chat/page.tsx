import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatErrorBoundary } from '@/components/chat/chat-error-boundary';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch knowledge base with file count
  const { data: knowledgeBase, error } = await supabase
    .from('knowledge_bases')
    .select(`
      *,
      files(count)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !knowledgeBase) {
    redirect('/dashboard');
  }

  const fileCount = knowledgeBase.files?.[0]?.count || 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/knowledge-bases/${id}`}>
                <Button variant="ghost" size="sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{knowledgeBase.name}</h1>
                <p className="text-sm text-slate-400">
                  {fileCount} file{fileCount !== 1 ? 's' : ''} • Chat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatErrorBoundary>
          <ChatInterface
            knowledgeBaseId={id}
            knowledgeBaseName={knowledgeBase.name}
            fileCount={fileCount}
          />
        </ChatErrorBoundary>
      </div>
    </div>
  );
}
