import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  emergency: { label: '紧急通知', emoji: '🚨' },
  marketplace: { label: '二手闲置', emoji: '🏪' },
  help: { label: '邻里互助', emoji: '🆘' },
  event: { label: '社区活动', emoji: '🎉' },
  pets: { label: '宠物交友', emoji: '🐕' },
  food: { label: '美食分享', emoji: '🍳' },
};

export async function GET() {
  try {
    // 获取各分类的统计数据
    const { data: posts, error } = await supabase
      .from('posts')
      .select('category, likes_count, comments_count, user_id, created_at');

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Fetched posts:', posts?.length);

    if (!posts || posts.length === 0) {
      console.log('No posts found');
      return NextResponse.json([]);
    }

    console.log('Processing posts:', posts.length);

    // 按分类统计
    const categoryStats = new Map<string, { 
      posts: number; 
      likes: number; 
      comments: number;
      users: Set<string>;
      thisWeek: number;
      lastWeek: number;
    }>();

    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    posts.forEach((post) => {
      if (!post.category) return;

      if (!categoryStats.has(post.category)) {
        categoryStats.set(post.category, {
          posts: 0,
          likes: 0,
          comments: 0,
          users: new Set(),
          thisWeek: 0,
          lastWeek: 0,
        });
      }

      const stats = categoryStats.get(post.category)!;
      stats.posts += 1;
      stats.likes += post.likes_count || 0;
      stats.comments += post.comments_count || 0;
      stats.users.add(post.user_id);

      const postDate = new Date(post.created_at);
      if (postDate >= thisWeekStart) {
        stats.thisWeek += 1;
      } else if (postDate >= lastWeekStart) {
        stats.lastWeek += 1;
      }
    });

    // 转换为数组并排序
    const topics = Array.from(categoryStats.entries())
      .map(([category, stats]) => {
        const trend = stats.thisWeek > stats.lastWeek ? 'up' as const 
          : stats.thisWeek < stats.lastWeek ? 'down' as const 
          : 'stable' as const;

        const categoryInfo = CATEGORY_LABELS[category] || { label: category, emoji: '📌' };

        return {
          category,
          label: categoryInfo.label,
          emoji: categoryInfo.emoji,
          count: stats.users.size,
          posts: stats.posts,
          likes: stats.likes,
          trend,
        };
      })
      .sort((a, b) => b.posts - a.posts)
      .map((topic, index) => ({ ...topic, rank: index + 1 }));

    console.log('Returning topics:', topics.length);
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching hot topics:', error);
    return NextResponse.json({ error: 'Failed to fetch hot topics' }, { status: 500 });
  }
}
