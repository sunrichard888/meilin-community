import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/actions/posts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 获取帖子列表（支持按用户 ID 筛选）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users (
          id,
          nickname,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // 返回数据并添加缓存头
    return NextResponse.json(
      { posts: posts || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST - 创建新帖子
export async function POST(request: NextRequest) {
  try {
    // 支持 JSON 和 FormData
    const contentType = request.headers.get('content-type');
    
    let content: string;
    let images: string[] = [];
    let token: string;

    if (contentType?.includes('application/json')) {
      const body = await request.json();
      content = body.content;
      images = body.images || [];
      token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
    } else {
      const formData = await request.formData();
      content = formData.get('content') as string;
      const imagesStr = formData.get('images') as string;
      images = imagesStr ? JSON.parse(imagesStr) : [];
      token = formData.get('token') as string;
    }

    if (!content || !token) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 调用 Server Action
    const result = await createPost(content, images, token);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[API POST /posts] Error:', error);
    return NextResponse.json(
      { error: error.message || '发布失败' },
      { status: 500 }
    );
  }
}
