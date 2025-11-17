import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, incrementQueryCount } from '@/lib/rate-limit';
import { incrementDatabaseQueryCount } from '@/lib/usage-tracking';

export const runtime = 'edge';

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

    // Check rate limit before processing
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetDate).toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You've reached your daily limit of ${rateLimit.limit} queries. Your limit will reset at ${resetTime} UTC.`,
          limit: rateLimit.limit,
          remaining: 0,
          resetDate: rateLimit.resetDate.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetDate.toISOString(),
          }
        }
      );
    }

    // Verify knowledge base ownership
    const { data: kb, error: kbError } = await supabase
      .from('knowledge_bases')
      .select('id, name, gemini_store_id')
      .eq('id', knowledgeBaseId)
      .eq('user_id', user.id)
      .single();

    if (kbError || !kb) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    // Check if knowledge base has files
    const { count: fileCount } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('knowledge_base_id', knowledgeBaseId)
      .eq('status', 'ready');

    if (fileCount === 0) {
      return NextResponse.json(
        { error: 'No documents available in this knowledge base' },
        { status: 400 }
      );
    }

    // Parse request body
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Convert messages to model format (extract content from parts array for assistant messages)
    const modelMessages = messages.map((m: any) => {
      if (m.role === 'assistant' && m.parts) {
        // Extract text from parts array
        const content = m.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');
        return { role: 'assistant', content };
      }
      return { role: m.role, content: m.content };
    });

    // Stream the response using Vercel AI SDK
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: modelMessages,
      system: `You are a helpful AI assistant that answers questions based on the uploaded documents in the knowledge base "${kb.name}".
File Search Store ID: ${kb.gemini_store_id || 'none'}

Instructions:
- Only answer questions based on the content in the uploaded documents
- If the answer is not in the documents, say "I don't have information about that in the uploaded documents"
- Be concise but thorough in your answers
- Cite specific information from the documents when relevant
- If asked about topics not in the documents, politely redirect to document-based questions`,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Increment query count for successful request (both in-memory and database)
    incrementQueryCount(user.id);
    // Fire and forget database tracking (don't await to avoid blocking response)
    incrementDatabaseQueryCount(user.id).catch((err) =>
      console.error('Error tracking query in database:', err)
    );

    // Add rate limit headers to response
    const updatedRateLimit = checkRateLimit(user.id);

    return result.toTextStreamResponse({
      headers: {
        'X-RateLimit-Limit': updatedRateLimit.limit.toString(),
        'X-RateLimit-Remaining': updatedRateLimit.remaining.toString(),
        'X-RateLimit-Reset': updatedRateLimit.resetDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/knowledge-bases/[id]/chat:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
