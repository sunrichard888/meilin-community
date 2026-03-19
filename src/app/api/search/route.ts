import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'latest'; // latest | hottest
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!query && !category) {
      return NextResponse.json({
        results: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    // 构建查询
    let dbQuery = supabase
      .from('posts')
      .select(`
        *,
        user:users (
          id,
          nickname,
          avatar
        )
      `, { count: 'exact' });

    // 全文搜索
    if (query) {
      // 使用全文搜索
      dbQuery = dbQuery.textSearch('search_vector', query, {
        config: 'simple',
        type: 'websearch',
      });
    }

    // 分类筛选
    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    // 排序
    if (sort === 'hottest') {
      dbQuery = dbQuery.order('likes_count', { ascending: false });
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    // 分页
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // 如果没有使用全文搜索，进行前端关键词匹配
    let results = posts || [];
    if (query && !posts?.length) {
      // 尝试简单的 LIKE 查询作为后备
      const { data: fallbackData } = await supabase
        .from('posts')
        .select(`
          *,
          user:users (
            id,
            nickname,
            avatar
          )
        `)
        .ilike('content', `%${query}%`)
        .limit(limit);

      results = fallbackData || [];
    }

    return NextResponse.json({
      results,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      query,
      category,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
