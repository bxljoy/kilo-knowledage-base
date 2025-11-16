import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToFileSearchStore, FILE_LIMITS, validateFile } from '@/lib/gemini';
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

    // Validate file type using the validation function from gemini.ts
    const validation = await validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
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

    // Validate PDF page count (only for PDF files)
    let pageCount = null;
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        pageCount = pdfDoc.getPageCount();

        if (pageCount > FILE_LIMITS.MAX_PAGES) {
          return NextResponse.json(
            {
              error: `PDF must have ${FILE_LIMITS.MAX_PAGES} pages or less (found ${pageCount} pages)`,
            },
            { status: 400 }
          );
        }
      } catch (pdfError) {
        console.error('Error processing PDF:', pdfError);
        return NextResponse.json(
          { error: 'Failed to process PDF file. File may be corrupted or invalid.' },
          { status: 400 }
        );
      }
    }

    // Upload file directly to FileSearchStore
    try {
      if (!kb.gemini_store_id) {
        return NextResponse.json(
          { error: 'Knowledge base does not have a FileSearchStore configured' },
          { status: 500 }
        );
      }

      // Upload file directly to the FileSearchStore
      const { documentId, operationName } = await uploadToFileSearchStore(
        file,
        kb.gemini_store_id,
        file.name
      );

      // Save file metadata to database
      const { data: savedFile, error: dbError } = await supabase
        .from('files')
        .insert({
          knowledge_base_id: knowledgeBaseId,
          file_name: file.name,
          file_size: file.size,
          page_count: pageCount,
          gemini_file_id: documentId,  // Store the document ID from FileSearchStore
          status: 'ready',  // File is ready once uploadToFileSearchStore completes
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
    } catch (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file. File may be corrupted or unsupported.' },
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
