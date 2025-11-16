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

  const fileCount = knowledgeBase.files?.[0]?.count || 0;

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
    <div className="container mx-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{knowledgeBase.name}</h1>
              {knowledgeBase.description && (
                <p className="text-sm text-gray-600">{knowledgeBase.description}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  {fileCount} / 10 files
                  <InfoTooltip content="Each knowledge base can hold up to 10 PDF files (10MB each)" />
                </span>
                <span>•</span>
                <span>Updated {new Date(knowledgeBase.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            {fileCount > 0 && (
              <Link href={`/dashboard/knowledge-bases/${id}/chat`}>
                <Button size="lg">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Chat with Documents
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
