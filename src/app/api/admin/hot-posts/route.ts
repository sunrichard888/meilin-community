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

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        likes_count,
        comments_count,
        user:users (
          nickname
        )
      `)
      .order('likes_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching hot posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error: any) {
    console.error('Error fetching hot posts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}
