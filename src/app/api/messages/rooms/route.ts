import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取用户会话列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // 使用数据库函数获取会话列表
    const { data, error } = await supabase.rpc('get_user_rooms', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error('[GET /api/messages/rooms] Database error:', error);
      // 降级处理：直接查询
      const { data: fallbackData } = await supabase
        .from('message_rooms')
        .select(`
          *,
          other_user:users!message_rooms_user2_id_fkey (
            id,
            nickname,
            avatar
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      return NextResponse.json({ success: true, data: fallbackData || [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[GET /api/messages/rooms] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取会话失败', success: false },
      { status: 500 }
    );
  }
}

// POST - 创建或获取会话
export async function POST(request: NextRequest) {
  try {
    const { user2_id } = await request.json();

    if (!user2_id) {
      return NextResponse.json(
        { error: '缺少 user2_id 参数' },
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

    // 不能和自己聊天
    if (user.id === user2_id) {
      return NextResponse.json(
        { error: '不能和自己聊天' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 使用数据库函数获取或创建会话
    const { data: roomId, error } = await supabase.rpc('get_or_create_room', {
      p_user1_id: user.id,
      p_user2_id: user2_id,
    });

    if (error) {
      console.error('[POST /api/messages/rooms] Database error:', error);
      return NextResponse.json(
        { error: '创建会话失败', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { room_id: roomId } });
  } catch (error: any) {
    console.error('[POST /api/messages/rooms] Error:', error);
    return NextResponse.json(
      { error: error.message || '创建会话失败', success: false },
      { status: 500 }
    );
  }
}
