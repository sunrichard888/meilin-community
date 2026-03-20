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

// DELETE - 删除公告
export async function DELETE(
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

    const { id: announcementId } = await params;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: error.message || '删除失败' }, { status: 500 });
  }
}

// PUT - 更新公告
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

    const { id: announcementId } = await params;
    const body = await request.json();
    const { is_pinned, title, content, category } = body;

    const updateData: any = {};
    if (typeof is_pinned === 'boolean') updateData.is_pinned = is_pinned;
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;

    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', announcementId);

    if (error) {
      console.error('Error updating announcement:', error);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: error.message || '更新失败' }, { status: 500 });
  }
}
