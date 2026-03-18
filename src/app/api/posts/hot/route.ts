import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取热门帖子（按点赞数排序）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

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
      .order('is_pinned', { ascending: false })
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[GET /api/posts/hot] Database error:', error);
      return NextResponse.json(
        { error: '获取热门帖子失败', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/posts/hot] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败', success: false },
      { status: 500 }
    );
  }
}
