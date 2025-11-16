import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteFileFromGemini, removeFileFromStore } from '@/lib/gemini';
import { updateStorageUsage } from '@/lib/usage-tracking';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get file details with ownership check (through knowledge base)
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select(`
        *,
        knowledge_bases!inner(
          id,
          user_id,
          gemini_store_id
        )
      `)
      .eq('id', fileId)
      .eq('knowledge_bases.user_id', user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Store file size for usage tracking
    const fileSize = file.file_size || 0;

    // Delete from Gemini first
    try {
      // Remove from FileSearchStore
      if (file.knowledge_bases.gemini_store_id && file.gemini_file_id) {
        await removeFileFromStore(
          file.knowledge_bases.gemini_store_id,
          file.gemini_file_id
        );
      }

      // Delete the file itself from Gemini
      if (file.gemini_file_id) {
        await deleteFileFromGemini(file.gemini_file_id);
      }
    } catch (geminiError) {
      console.error('Error deleting from Gemini:', geminiError);
      // Continue with database deletion even if Gemini deletion fails
    }

    // Delete file from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('Error deleting file from database:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    // Update storage usage (decrease by file size)
    if (fileSize > 0) {
      await updateStorageUsage(user.id, -fileSize);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/files/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
