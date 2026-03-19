import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取消息列表（按会话分组）
export async function GET(request: NextRequest) {
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

    // 获取用户的消息会话（按对方用户分组）
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey (
          id,
          nickname,
          avatar
        ),
        to_user:users!messages_to_user_id_fkey (
          id,
          nickname,
          avatar
        )
      `)
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // 按会话分组
    const conversations = new Map<string, any>();

    messages?.forEach((msg) => {
      const otherUserId = msg.from_user_id === user.id ? msg.to_user_id : msg.from_user_id;
      const otherUser = msg.from_user_id === user.id ? msg.to_user : msg.from_user;

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // 计算未读数
      if (!msg.read && msg.to_user_id === user.id) {
        conversations.get(otherUserId).unreadCount += 1;
      }
    });

    const result = Array.from(conversations.values()).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );

    return NextResponse.json({ conversations: result });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - 发送消息
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
    const { to_user_id, content } = body;

    if (!to_user_id || !content?.trim()) {
      return NextResponse.json(
        { error: '收件人和内容不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        to_user_id,
        content: content.trim(),
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
      console.error('Error sending message:', error);
      return NextResponse.json({ error: '发送失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message || '发送失败' }, { status: 500 });
  }
}
