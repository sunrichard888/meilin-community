import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取单个帖子详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: '缺少帖子 ID' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users (
          id,
          nickname,
          avatar
        )
      `)
      .eq('id', postId)
      .single();

    if (error || !data) {
      console.error('[GET /api/posts/[id]] Database error:', error);
      return NextResponse.json(
        { error: '帖子不存在', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/posts/[id]] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取帖子失败', success: false },
      { status: 500 }
    );
  }
}
