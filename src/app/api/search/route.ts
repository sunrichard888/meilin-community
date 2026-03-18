import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 搜索帖子或用户
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'posts', 'users', 'all'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const community = searchParams.get('community');

    if (!q || !q.trim()) {
      return NextResponse.json(
        { error: '缺少搜索关键词' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results: any = {};

    // 搜索帖子
    if (type === 'all' || type === 'posts') {
      const { data: postsData, error: postsError } = await supabase.rpc('search_posts', {
        search_query: q.trim(),
        p_limit: limit,
        p_offset: offset,
        p_community_name: community || null,
        p_user_id: null,
      });

      if (postsError) {
        console.error('[GET /api/search] Posts search error:', postsError);
        // 降级处理：直接查询
        const { data: fallbackPosts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users (
              nickname,
              avatar
            )
          `)
          .ilike('content', `%${q.trim()}%`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        results.posts = fallbackPosts || [];
      } else {
        results.posts = postsData || [];
      }
    }

    // 搜索用户
    if (type === 'all' || type === 'users') {
      const { data: usersData, error: usersError } = await supabase.rpc('search_users', {
        search_query: q.trim(),
        p_limit: limit,
        p_offset: offset,
      });

      if (usersError) {
        console.error('[GET /api/search] Users search error:', usersError);
        // 降级处理：直接查询
        const { data: fallbackUsers } = await supabase
          .from('users')
          .select('*')
          .ilike('nickname', `%${q.trim()}%`)
          .range(offset, offset + limit - 1);

        results.users = fallbackUsers || [];
      } else {
        results.users = usersData || [];
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('[GET /api/search] Error:', error);
    return NextResponse.json(
      { error: error.message || '搜索失败' },
      { status: 500 }
    );
  }
}
