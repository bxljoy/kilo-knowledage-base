import { createClient } from '@/lib/supabase/server';
import { deleteFileSearchStore } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch knowledge base with ownership check
    const { data: knowledgeBase, error } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    console.error('Error in GET /api/knowledge-bases/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'Name must be a string' },
          { status: 400 }
        );
      }

      if (name.trim().length < 3) {
        return NextResponse.json(
          { error: 'Name must be at least 3 characters long' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: { name?: string; description?: string | null } = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined)
      updates.description = description?.trim() || null;

    // Update knowledge base with ownership check
    const { data: knowledgeBase, error } = await supabase
      .from('knowledge_bases')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    console.error('Error in PATCH /api/knowledge-bases/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the knowledge base to retrieve the Gemini store ID
    const { data: knowledgeBase, error: fetchError } = await supabase
      .from('knowledge_bases')
      .select('gemini_store_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    // Delete from Gemini first
    try {
      if (knowledgeBase.gemini_store_id) {
        await deleteFileSearchStore(knowledgeBase.gemini_store_id);
      }
    } catch (geminiError) {
      console.error('Error deleting Gemini store:', geminiError);
      // Continue with database deletion even if Gemini deletion fails
    }

    // Delete knowledge base from database
    // Note: Files will be automatically deleted due to ON DELETE CASCADE
    const { error: deleteError } = await supabase
      .from('knowledge_bases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting knowledge base:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete knowledge base' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/knowledge-bases/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
