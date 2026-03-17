import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    // 创建 Supabase SSR 客户端
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
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
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 创建 Supabase SSR 客户端
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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
    console.error('Error saving privacy settings:', error);
    return NextResponse.json(
      { error: error.message || '保存失败' },
      { status: 500 }
    );
  }
}
