import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 公开社区统计 API
 * 不需要认证，任何人都可以访问
 */
export async function GET() {
  try {
    // 用户统计
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 7 日活跃用户（发过帖的用户）
    const activeUsersResult = await supabase
      .from('posts')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const activeUsers = activeUsersResult.data || [];
    const activeUsers7d = new Set(activeUsers.map(u => u.user_id)).size;

    // 帖子统计
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    const { count: postsToday } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers7d: activeUsers7d || 0,
      totalPosts: totalPosts || 0,
      postsToday: postsToday || 0,
    });
  } catch (error: any) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch stats',
      totalUsers: 0,
      activeUsers7d: 0,
      totalPosts: 0,
      postsToday: 0,
    }, { status: 500 });
  }
}
