import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname } = await request.json();

    // 验证输入
    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要 6 位字符' },
        { status: 400 }
      );
    }

    // 使用 Service Role Key（服务端专用，绕过 RLS）
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

    // 1. 创建 Auth 用户
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自动确认邮箱（生产环境可改为 false 发送确认邮件）
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('创建用户失败');

    // 2. 创建用户资料（使用 service key 可绕过 RLS）
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        nickname,
        role: 'user',
      });

    if (profileError) throw profileError;

    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id 
    });
  } catch (error: any) {
    // 错误分类处理
    let errorMessage = '注册失败，请稍后重试';
    
    if (error.message?.includes('already')) {
      errorMessage = '该邮箱已注册，请直接登录';
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = '邮箱格式不正确';
    } else if (error.message?.includes('password')) {
      errorMessage = '密码不符合要求';
    } else if (error.code === '401' || error.message?.includes('Unauthorized')) {
      errorMessage = '认证失败，请检查账号密码';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
