import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - 获取评论列表
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users (
          nickname,
          avatar
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[GET /api/comments] Database error:', error);
      return NextResponse.json(
        { error: '获取评论失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/comments] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取评论失败' },
      { status: 500 }
    );
  }
}

// POST - 创建评论
export async function POST(request: NextRequest) {
  try {
    const { post_id, content } = await request.json();

    if (!post_id || !content) {
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
        { error: '评论内容不能为空' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: '评论内容不能超过 500 字' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        user:users (
          nickname,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('[POST /api/comments] Database error:', error);
      return NextResponse.json(
        { error: '评论失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[POST /api/comments] Error:', error);
    return NextResponse.json(
      { error: error.message || '评论失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { error: '缺少评论 ID' },
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

    // 验证评论所有权
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权删除此评论' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('[DELETE /api/comments] Database error:', error);
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/comments] Error:', error);
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    );
  }
}
