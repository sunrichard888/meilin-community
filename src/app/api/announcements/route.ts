import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取公告列表
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        author:users (
          nickname
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST - 创建新公告（仅管理员）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, is_pinned } = body;

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    // 获取当前用户（从请求头获取 token）
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 验证用户是否为管理员
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 检查用户角色
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: '无权发布公告' },
        { status: 403 }
      );
    }

    // 创建公告
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        category: category || 'notice',
        is_pinned: is_pinned || false,
        author_id: user.id,
      })
      .select(`
        *,
        author:users (
          nickname
        )
      `)
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        { error: '发布失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: error.message || '发布失败' },
      { status: 500 }
    );
  }
}
