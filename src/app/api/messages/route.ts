import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取消息历史
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const room_id = searchParams.get('room_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!room_id) {
      return NextResponse.json(
        { error: '缺少 room_id 参数' },
        { status: 400 }
      );
    }

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

    // 验证用户是否有权限访问此会话
    const { data: room } = await supabase
      .from('message_rooms')
      .select('user1_id, user2_id')
      .eq('id', room_id)
      .single();

    if (!room || (room.user1_id !== user.id && room.user2_id !== user.id)) {
      return NextResponse.json(
        { error: '无权访问此会话' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey (
          id,
          nickname,
          avatar
        )
      `)
      .eq('room_id', room_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[GET /api/messages] Database error:', error);
      return NextResponse.json(
        { error: '获取消息失败', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[GET /api/messages] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取消息失败', success: false },
      { status: 500 }
    );
  }
}

// POST - 发送消息
export async function POST(request: NextRequest) {
  try {
    const { room_id, content } = await request.json();

    if (!room_id || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

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

    // 验证内容
    if (!content.trim()) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '消息内容不能超过 1000 字' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 验证用户是否有权限在此会话中发送消息
    const { data: room } = await supabase
      .from('message_rooms')
      .select('user1_id, user2_id')
      .eq('id', room_id)
      .single();

    if (!room || (room.user1_id !== user.id && room.user2_id !== user.id)) {
      return NextResponse.json(
        { error: '无权在此会话中发送消息' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id,
        from_user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey (
          id,
          nickname,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('[POST /api/messages] Database error:', error);
      return NextResponse.json(
        { error: '发送消息失败', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[POST /api/messages] Error:', error);
    return NextResponse.json(
      { error: error.message || '发送消息失败', success: false },
      { status: 500 }
    );
  }
}
