import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    // 验证输入
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码至少 6 位' },
        { status: 400 }
      );
    }

    // 使用 Service Role Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. 验证当前密码（尝试登录）
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 401 }
      );
    }

    // 2. 更新密码
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      signInData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json(
        { error: '密码修改失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '密码修改成功，请使用新密码登录'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '密码修改失败' },
      { status: 500 }
    );
  }
}
