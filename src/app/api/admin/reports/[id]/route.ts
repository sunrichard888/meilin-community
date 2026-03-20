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

// PUT - 处理举报
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(token);
    if (!isAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id: reportId } = await params;
    const body = await request.json();
    const { action } = body; // 'delete' | 'ignore'

    if (!action || !['delete', 'ignore'].includes(action)) {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    // 获取举报信息
    const { data: report } = await supabase
      .from('reports')
      .select('post_id')
      .eq('id', reportId)
      .single();

    if (!report) {
      return NextResponse.json({ error: '举报不存在' }, { status: 404 });
    }

    if (action === 'delete' && report.post_id) {
      // 删除帖子
      await supabase
        .from('posts')
        .delete()
        .eq('id', report.post_id);
    }

    // 更新举报状态
    await supabase
      .from('reports')
      .update({ 
        status: action === 'delete' ? 'resolved' : 'rejected',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resolving report:', error);
    return NextResponse.json({ error: error.message || '处理失败' }, { status: 500 });
  }
}
