import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST - 点赞/取消点赞
export async function POST(request: NextRequest) {
  try {
    const { post_id } = await request.json();

    if (!post_id) {
      return NextResponse.json(
        { error: '缺少 post_id 参数' },
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

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single();

    let liked: boolean;

    if (existingLike) {
      // 取消点赞
      await supabase.from('likes').delete().eq('id', existingLike.id);
      liked = false;
    } else {
      // 点赞
      await supabase.from('likes').insert({
        post_id,
        user_id: user.id,
      });
      liked = true;
    }

    return NextResponse.json({ success: true, liked });
  } catch (error: any) {
    console.error('[POST /api/likes] Error:', error);
    return NextResponse.json(
      { error: error.message || '操作失败' },
      { status: 500 }
    );
  }
}

// GET - 获取用户是否已点赞
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: '缺少 post_id 参数' },
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

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ 
      success: true, 
      liked: !!data 
    });
  } catch (error: any) {
    console.error('[GET /api/likes] Error:', error);
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    );
  }
}
