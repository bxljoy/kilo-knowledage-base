import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadFileToGemini, addFileToStore, FILE_LIMITS } from '@/lib/gemini';
import { PDFDocument } from 'pdf-lib';
import {
  checkFileUploadQuota,
  checkFileSizeQuota,
  checkStorageQuota,
} from '@/lib/quota-enforcement';
import {
  incrementFileUploadCount,
  updateStorageUsage,
} from '@/lib/usage-tracking';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: knowledgeBaseId } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify knowledge base ownership
    const { data: kb, error: kbError } = await supabase
      .from('knowledge_bases')
      .select('id, gemini_store_id')
      .eq('id', knowledgeBaseId)
      .eq('user_id', user.id)
      .single();

    if (kbError || !kb) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    // Parse form data early to check file size quota
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!FILE_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Check file upload quota (max files per KB)
    const fileQuota = await checkFileUploadQuota(user.id, knowledgeBaseId);
    if (!fileQuota.allowed) {
      return NextResponse.json(
        {
          error: fileQuota.message,
          quota: {
            current: fileQuota.current,
            limit: fileQuota.limit,
            remaining: fileQuota.remaining,
          },
        },
        { status: 403 }
      );
    }

    // Check file size quota
    const sizeQuota = checkFileSizeQuota(file.size);
    if (!sizeQuota.allowed) {
      return NextResponse.json(
        { error: sizeQuota.message },
        { status: 400 }
      );
    }

    // Check storage quota
    const storageQuota = await checkStorageQuota(user.id, file.size);
    if (!storageQuota.allowed) {
      return NextResponse.json(
        {
          error: storageQuota.message,
          quota: {
            current: storageQuota.current,
            limit: storageQuota.limit,
            remaining: storageQuota.remaining,
          },
        },
        { status: 403 }
      );
    }

    // Validate PDF page count
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      if (pageCount > FILE_LIMITS.MAX_PAGES) {
        return NextResponse.json(
          {
            error: `PDF must have ${FILE_LIMITS.MAX_PAGES} pages or less (found ${pageCount} pages)`,
          },
          { status: 400 }
        );
      }

      // Upload file to Gemini
      const { fileId, uri, state } = await uploadFileToGemini(file, file.name);

      // Add file to the knowledge base's FileSearchStore
      if (kb.gemini_store_id) {
        await addFileToStore(kb.gemini_store_id, fileId);
      }

      // Save file metadata to database
      const { data: savedFile, error: dbError } = await supabase
        .from('files')
        .insert({
          knowledge_base_id: knowledgeBaseId,
          filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          page_count: pageCount,
          gemini_file_id: fileId,
          gemini_uri: uri,
          status: state.toLowerCase(),
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving file to database:', dbError);
        // TODO: Clean up Gemini file if database insert fails
        return NextResponse.json(
          { error: 'Failed to save file metadata' },
          { status: 500 }
        );
      }

      // Track file upload and storage usage
      await Promise.all([
        incrementFileUploadCount(user.id),
        updateStorageUsage(user.id, file.size),
      ]);

      return NextResponse.json(savedFile, { status: 201 });
    } catch (pdfError) {
      console.error('Error processing PDF:', pdfError);
      return NextResponse.json(
        { error: 'Failed to process PDF file. File may be corrupted or invalid.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/knowledge-bases/[id]/files:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
