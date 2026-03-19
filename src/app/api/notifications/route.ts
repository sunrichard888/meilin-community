import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取通知列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 获取当前用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // 构建查询
    let query = supabase
      .from('notifications')
      .select(`
        *,
        actor:users!notifications_actor_id_fkey (
          id,
          nickname,
          avatar
        ),
        post:posts (
          id,
          content
        ),
        comment:comments (
          id,
          content
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - 标记通知为已读
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id, mark_all_read } = body;

    if (mark_all_read) {
      // 标记所有通知为已读
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    } else if (notification_id) {
      // 标记单个通知为已读
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark as read' }, { status: 500 });
  }
}
