import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取与特定用户的对话消息
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

    const searchParams = request.nextUrl.searchParams;
    const otherUserId = searchParams.get('user_id');

    if (!otherUserId) {
      return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey (
          id,
          nickname,
          avatar
        )
      `)
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching conversation:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // 标记为已读
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('to_user_id', user.id)
      .eq('from_user_id', otherUserId)
      .eq('read', false);

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}
