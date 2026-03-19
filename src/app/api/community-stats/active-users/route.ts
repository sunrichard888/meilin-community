import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 获取活跃用户（按发帖数和点赞数排序）
    const { data: users } = await supabase
      .from('users')
      .select(`
        id,
        nickname,
        avatar,
        posts (
          id,
          likes_count
        )
      `)
      .limit(50);

    if (!users) {
      return NextResponse.json([]);
    }

    // 计算每个用户的统计数据
    const userStats = users
      .map((user) => ({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        posts: user.posts?.length || 0,
        likes: user.posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0,
      }))
      .filter((u) => u.posts > 0) // 只显示有发帖的用户
      .sort((a, b) => b.posts - a.posts || b.likes - a.likes)
      .slice(0, 10)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return NextResponse.json(userStats);
  } catch (error) {
    console.error('Error fetching active user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch active user stats' }, { status: 500 });
  }
}
