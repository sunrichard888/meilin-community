import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { avatar } = await request.json();

    if (!avatar) {
      return NextResponse.json(
        { error: '头像数据不能为空' },
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
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '认证失败' },
        { status: 401 }
      );
    }

    // 使用 Service Role Key 上传到 Storage
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${user.id}-${timestamp}-${randomStr}.jpg`;
    const path = `avatars/${fileName}`;

    // 将 DataURL 转换为 Blob
    const base64Data = avatar.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('post-images')
      .upload(path, buffer, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: '上传失败：' + uploadError.message },
        { status: 500 }
      );
    }

    // 获取公开 URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('post-images')
      .getPublicUrl(path);

    // 更新 users 表
    const { error: updateError } = await serviceSupabase
      .from('users')
      .update({ avatar: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: '更新用户信息失败', uploadError: uploadError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: error.message || '上传失败' },
      { status: 500 }
    );
  }
}
