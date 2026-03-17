import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/actions/posts';

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
