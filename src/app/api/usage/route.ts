import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAllQuotas } from '@/lib/quota-enforcement';

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

    // Get all quota information
    const quotas = await getAllQuotas(user.id);

    if (!quotas) {
      return NextResponse.json(
        { error: 'Failed to fetch usage statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json(quotas);
  } catch (error) {
    console.error('Error in GET /api/usage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
