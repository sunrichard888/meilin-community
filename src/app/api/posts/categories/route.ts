import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 获取帖子分类统计（公开 API）
 */
export async function GET() {
  try {
    // 获取所有分类的帖子数量
    const categories = [
      { category: 'all', label: '全部' },
      { category: 'marketplace', label: '二手闲置' },
      { category: 'help', label: '邻里互助' },
      { category: 'event', label: '社区活动' },
      { category: 'pets', label: '宠物交友' },
      { category: 'emergency', label: '紧急通知' },
      { category: 'notice', label: '公告通知' },
    ];

    const stats = await Promise.all(
      categories.map(async (cat) => {
        let query = supabase.from('posts').select('*', { count: 'exact', head: true });
        
        if (cat.category !== 'all') {
          query = query.eq('category', cat.category);
        }

        const { count } = await query;
        return {
          category: cat.category,
          count: count || 0,
        };
      })
    );

    return NextResponse.json({ 
      categories: stats,
    });
  } catch (error: any) {
    console.error('Error fetching category stats:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch stats',
      categories: [],
    }, { status: 500 });
  }
}
