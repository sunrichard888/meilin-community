import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 使用 Service Role Key 绕过 RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 验证 token 获取用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[GET Privacy Settings] Auth error:', authError);
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 使用 service role key 查询
    const { data, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[GET Privacy Settings] DB error:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json({ 
        success: true, 
        data: {
          show_community_name: true,
          show_building_info: false,
          show_introduction: true,
          show_nickname: true,
          allow_direct_messages: true,
          allow_comments: true,
          allow_mentions: true,
          notify_new_comments: true,
          notify_new_likes: true,
          notify_new_followers: true,
          notify_community_updates: true,
          privacy_preset: 'custom',
        }
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET Privacy Settings] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 使用 Service Role Key 绕过 RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error('[POST Privacy Settings] No auth header');
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 验证 token 获取用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[POST Privacy Settings] Auth error:', authError);
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const {
      show_community_name,
      show_building_info,
      show_introduction,
      show_nickname,
      allow_direct_messages,
      allow_comments,
      allow_mentions,
      notify_new_comments,
      notify_new_likes,
      notify_new_followers,
      notify_community_updates,
      privacy_preset,
    } = body;

    if (privacy_preset && !['public', 'neighbors_only', 'private', 'custom'].includes(privacy_preset)) {
      return NextResponse.json({ error: '无效的隐私预设' }, { status: 400 });
    }

    // 检查是否已存在
    const { data: existing } = await supabase
      .from('user_privacy_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    
    if (existing) {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .update({
          show_community_name,
          show_building_info,
          show_introduction,
          show_nickname,
          allow_direct_messages,
          allow_comments,
          allow_mentions,
          notify_new_comments,
          notify_new_likes,
          notify_new_followers,
          notify_community_updates,
          privacy_preset,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .insert({
          user_id: user.id,
          show_community_name,
          show_building_info,
          show_introduction,
          show_nickname,
          allow_direct_messages,
          allow_comments,
          allow_mentions,
          notify_new_comments,
          notify_new_likes,
          notify_new_followers,
          notify_community_updates,
          privacy_preset,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[POST Privacy Settings] Error:', error);
    return NextResponse.json(
      { error: error.message || '保存失败' },
      { status: 500 }
    );
  }
}
