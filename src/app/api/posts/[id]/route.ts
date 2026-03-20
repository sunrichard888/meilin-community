import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取帖子详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users (
          id,
          nickname,
          avatar
        )
      `)
      .eq('id', postId)
      .single();

    if (error || !data) {
      console.error('Error fetching post:', error);
      return NextResponse.json(
        { error: '帖子不存在', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: error.message || '获取失败', success: false },
      { status: 500 }
    );
  }
}

// DELETE - 删除帖子
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: postId } = await params;

    // 验证帖子所有权
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: '无权删除此帖子' }, { status: 403 });
    }

    // 删除帖子（级联删除评论和点赞）
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: error.message || '删除失败' }, { status: 500 });
  }
}

// PUT - 更新帖子
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: postId } = await params;
    const body = await request.json();
    const { content, images, category } = body;

    // 验证帖子所有权
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: '无权编辑此帖子' }, { status: 403 });
    }

    // 验证内容
    if (content && content.trim().length === 0) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (content && content.length > 1000) {
      return NextResponse.json({ error: '内容不能超过 1000 字' }, { status: 400 });
    }

    // 更新帖子
    const updateData: any = {};
    if (content) updateData.content = content.trim();
    if (images) updateData.images = images;
    if (category) updateData.category = category;

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select(`
        *,
        user:users (
          id,
          nickname,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: error.message || '更新失败' }, { status: 500 });
  }
}
