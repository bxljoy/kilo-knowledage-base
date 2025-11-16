import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { rating, knowledgeBaseId } = await request.json();

    // Validate rating
    if (rating !== -1 && rating !== 1) {
      return NextResponse.json(
        { error: 'Rating must be -1 or 1' },
        { status: 400 }
      );
    }

    // Verify knowledge base ownership
    const { data: kb, error: kbError } = await supabase
      .from('knowledge_bases')
      .select('id')
      .eq('id', knowledgeBaseId)
      .eq('user_id', user.id)
      .single();

    if (kbError || !kb) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    // Upsert rating (insert or update if exists)
    const { data: ratingData, error: ratingError } = await supabase
      .from('message_ratings')
      .upsert(
        {
          user_id: user.id,
          knowledge_base_id: knowledgeBaseId,
          message_id: messageId,
          rating,
        },
        {
          onConflict: 'user_id,message_id',
        }
      )
      .select()
      .single();

    if (ratingError) {
      console.error('Error saving rating:', ratingError);
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, rating: ratingData });
  } catch (error) {
    console.error('Error in POST /api/messages/[messageId]/rating:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete rating
    const { error: deleteError } = await supabase
      .from('message_ratings')
      .delete()
      .eq('user_id', user.id)
      .eq('message_id', messageId);

    if (deleteError) {
      console.error('Error deleting rating:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/messages/[messageId]/rating:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
