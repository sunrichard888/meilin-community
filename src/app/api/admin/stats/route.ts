import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 验证管理员权限
async function checkAdmin(token: string): Promise<boolean> {
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) return false;

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return userData?.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(token);
    if (!isAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    // 用户统计
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsersToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    // 帖子统计
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    const { count: postsToday } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    // 举报统计
    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 7 日活跃用户（发过帖的用户）
    const activeUsersResult = await supabase
      .from('posts')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const activeUsers = activeUsersResult.data || [];
    const activeUsers7d = new Set(activeUsers.map(u => u.user_id)).size;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      newUsersToday: newUsersToday || 0,
      totalPosts: totalPosts || 0,
      postsToday: postsToday || 0,
      totalReports: totalReports || 0,
      pendingReports: pendingReports || 0,
      activeUsers7d,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
