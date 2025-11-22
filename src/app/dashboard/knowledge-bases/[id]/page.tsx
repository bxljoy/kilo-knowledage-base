import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FileUploadArea } from '@/components/file-upload/file-upload-area';
import { FileList } from '@/components/file-upload/file-list';
import { EmptyFileList } from '@/components/file-upload/empty-file-list';
import { InfoTooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface KnowledgeBasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KnowledgeBasePage({ params }: KnowledgeBasePageProps) {
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

  const fileCount = (knowledgeBase as any).files?.[0]?.count || 0;

  // Fetch files for this knowledge base
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('knowledge_base_id', id)
    .order('uploaded_at', { ascending: false });

  if (filesError) {
    console.error('Error fetching files:', filesError);
  }

  console.log('Files fetched:', files?.length || 0, 'files');

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">{(knowledgeBase as any).name}</h1>
              {(knowledgeBase as any).description && (
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">{(knowledgeBase as any).description}</p>
              )}
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  {fileCount} / 10 files
                  <InfoTooltip content="Each knowledge base can hold up to 10 PDF files (10MB each)" />
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs">Updated {new Date((knowledgeBase as any).updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            {fileCount > 0 && (
              <Link href={`/dashboard/knowledge-bases/${id}/chat`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Chat with Documents</span>
                  <span className="sm:hidden ml-2">Chat</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <FileUploadArea
            knowledgeBaseId={id}
            currentFileCount={fileCount}
            maxFiles={10}
          />
        </div>

        {/* File List */}
        {files && files.length > 0 ? (
          <FileList files={files} />
        ) : (
          <EmptyFileList />
        )}
      </div>
    </div>
  );
}
