import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取未读通知数量
export async function GET(request: NextRequest) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '认证失败' },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 尝试从物化视图获取
    const { data: viewData } = await supabase
      .from('user_unread_counts')
      .select('unread_count')
      .eq('user_id', user.id)
      .single();

    if (viewData) {
      return NextResponse.json({ 
        success: true, 
        count: viewData.unread_count 
      });
    }

    // 如果物化视图不存在，直接查询
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('[GET /api/notifications/unread-count] Database error:', error);
      return NextResponse.json(
        { error: '获取未读数失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      count: data ? 0 : 0 
    });
  } catch (error: any) {
    console.error('[GET /api/notifications/unread-count] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// POST - 标记所有通知为已读
export async function POST(request: NextRequest) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '认证失败' },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 使用数据库函数
    const { error } = await supabase.rpc('mark_all_notifications_read', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('[POST /api/notifications/mark-all-read] Database error:', error);
      // 降级处理：直接更新
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/notifications/mark-all-read] Error:', error);
    return NextResponse.json(
      { error: error.message || '操作失败' },
      { status: 500 }
    );
  }
}
