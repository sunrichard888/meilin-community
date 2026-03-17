import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/actions/posts';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const token = formData.get('token') as string;

    if (!content || !token) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 调用 Server Action
    const result = await createPost(content, [], token);

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
