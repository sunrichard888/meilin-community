import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取搜索建议
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!q || !q.trim() || q.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 尝试使用数据库函数
    const { data, error } = await supabase.rpc('get_search_suggestions', {
      search_query: q.trim(),
      p_limit: limit,
    });

    if (error) {
      console.error('[GET /api/search/suggestions] Database error:', error);
      
      // 降级处理：直接查询
      const [postsResult, usersResult] = await Promise.all([
        supabase
          .from('posts')
          .select('id, content, user:users(nickname)')
          .ilike('content', `%${q.trim()}%`)
          .limit(limit),
        supabase
          .from('users')
          .select('id, nickname')
          .ilike('nickname', `%${q.trim()}%`)
          .limit(limit),
      ]);

      const suggestions = [
        ...(postsResult.data || []).map((p: any) => ({
          type: 'post',
          id: p.id,
          text: p.content.substring(0, 50),
          extra_info: p.user?.nickname || '',
        })),
        ...(usersResult.data || []).map((u: any) => ({
          type: 'user',
          id: u.id,
          text: u.nickname,
          extra_info: '',
        })),
      ];

      return NextResponse.json({ success: true, data: suggestions.slice(0, limit) });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/search/suggestions] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取建议失败' },
      { status: 500 }
    );
  }
}
