import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 获取用户统计
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 计算新增用户
    const { count: newUsersToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    const { count: newUsersThisWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // 获取帖子统计
    const { count: postsToday } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    const { count: postsThisWeek } = await supabase
      .from('posts')
      .select('likes_count, comments_count', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { count: postsThisMonth } = await supabase
      .from('posts')
      .select('likes_count, comments_count', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // 获取总点赞数
    const { data: allPosts } = await supabase
      .from('posts')
      .select('likes_count, comments_count');

    const totalLikes = allPosts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
    const totalComments = allPosts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;

    // 获取活动分类帖子数
    const { count: ongoingEvents } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'event');

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      todayPosts: postsToday || 0,
      ongoingEvents: ongoingEvents || 0,
      verifiedBusinesses: 8, // 暂时固定值
      totalPosts: allPosts?.length || 0,
      totalComments,
      totalLikes,
      newUsersToday,
      newUsersThisWeek,
      postsThisWeek,
      postsThisMonth,
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
