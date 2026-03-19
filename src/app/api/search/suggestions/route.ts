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

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // 获取热门搜索建议（从现有帖子内容提取）
    const { data: posts } = await supabase
      .from('posts')
      .select('content')
      .ilike('content', `%${query}%`)
      .limit(5);

    const suggestions = posts?.map(post => {
      // 提取包含关键词的片段
      const index = post.content.toLowerCase().indexOf(query.toLowerCase());
      const start = Math.max(0, index - 20);
      const end = Math.min(post.content.length, index + query.length + 30);
      const snippet = post.content.substring(start, end);
      return snippet.length < post.content.length ? `...${snippet}...` : snippet;
    }).filter(Boolean) || [];

    // 获取分类建议
    const categories = [
      { id: 'emergency', name: '紧急通知', emoji: '🚨' },
      { id: 'marketplace', name: '二手闲置', emoji: '🏪' },
      { id: 'help', name: '邻里互助', emoji: '🆘' },
      { id: 'event', name: '社区活动', emoji: '🎉' },
      { id: 'pets', name: '宠物交友', emoji: '🐕' },
      { id: 'food', name: '美食分享', emoji: '🍳' },
    ];

    const matchingCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      suggestions: suggestions.slice(0, 5),
      categories: matchingCategories,
      query,
    });
  } catch (error: any) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
