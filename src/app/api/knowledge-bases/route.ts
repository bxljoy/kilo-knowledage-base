import { createClient } from '@/lib/supabase/server';
import { createFileSearchStore, deleteFileSearchStore } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { checkKnowledgeBaseQuota } from '@/lib/quota-enforcement';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's knowledge bases
    const { data: knowledgeBases, error } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge bases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge bases' },
        { status: 500 }
      );
    }

    return NextResponse.json(knowledgeBases);
  } catch (error) {
    console.error('Error in GET /api/knowledge-bases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check knowledge base quota
    const kbQuota = await checkKnowledgeBaseQuota(user.id);
    if (!kbQuota.allowed) {
      return NextResponse.json(
        {
          error: kbQuota.message,
          quota: {
            current: kbQuota.current,
            limit: kbQuota.limit,
            remaining: kbQuota.remaining,
          },
        },
        { status: 403 }
      );
    }

    // Create Gemini FileSearchStore
    let fileSearchStore;
    try {
      fileSearchStore = await createFileSearchStore(name.trim());
    } catch (geminiError) {
      console.error('Error creating Gemini store:', geminiError);
      return NextResponse.json(
        { error: 'Failed to create knowledge base storage' },
        { status: 500 }
      );
    }

    // Create knowledge base in database
    const { data: knowledgeBase, error: dbError } = await supabase
      .from('knowledge_bases')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        gemini_store_id: fileSearchStore.storeId,
      } as any)
      .select()
      .single();

    if (dbError) {
      console.error('Error creating knowledge base:', dbError);
      // Rollback: Clean up Gemini store if database insert fails
      try {
        await deleteFileSearchStore(fileSearchStore.storeId);
      } catch (cleanupError) {
        console.error('Error cleaning up Gemini store:', cleanupError);
      }
      return NextResponse.json(
        { error: 'Failed to create knowledge base' },
        { status: 500 }
      );
    }

    return NextResponse.json(knowledgeBase, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/knowledge-bases:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
