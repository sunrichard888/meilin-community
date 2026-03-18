import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取关注列表/粉丝列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type') || 'follows'; // 'follows' or 'followers'

    if (!userId) {
      return NextResponse.json(
        { error: '缺少 user_id 参数' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query;
    if (type === 'followers') {
      // 获取粉丝列表（谁关注了我）
      query = supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          follower:users!follows_follower_id_fkey (
            id,
            nickname,
            avatar
          )
        `)
        .eq('followee_id', userId);
    } else {
      // 获取关注列表（我关注了谁）
      query = supabase
        .from('follows')
        .select(`
          followee_id,
          created_at,
          followee:users!follows_followee_id_fkey (
            id,
            nickname,
            avatar
          )
        `)
        .eq('follower_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/follows] Database error:', error);
      return NextResponse.json(
        { error: '获取关注列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/follows] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// POST - 关注用户
export async function POST(request: NextRequest) {
  try {
    const { followee_id } = await request.json();

    if (!followee_id) {
      return NextResponse.json(
        { error: '缺少 followee_id 参数' },
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

    // 不能关注自己
    if (user.id === followee_id) {
      return NextResponse.json(
        { error: '不能关注自己' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 检查是否已关注
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('followee_id', followee_id)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: '已关注该用户' },
        { status: 400 }
      );
    }

    // 创建关注关系
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        followee_id,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/follows] Database error:', error);
      return NextResponse.json(
        { error: '关注失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[POST /api/follows] Error:', error);
    return NextResponse.json(
      { error: error.message || '关注失败' },
      { status: 500 }
    );
  }
}

// DELETE - 取消关注
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const followeeId = searchParams.get('user_id');

    if (!followeeId) {
      return NextResponse.json(
        { error: '缺少 user_id 参数' },
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

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followee_id', followeeId);

    if (error) {
      console.error('[DELETE /api/follows] Database error:', error);
      return NextResponse.json(
        { error: '取消关注失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/follows] Error:', error);
    return NextResponse.json(
      { error: error.message || '取消关注失败' },
      { status: 500 }
    );
  }
}

// GET - 检查是否已关注
export async function checkFollow(followerId: string, followeeId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .single();

  return !!data;
}
