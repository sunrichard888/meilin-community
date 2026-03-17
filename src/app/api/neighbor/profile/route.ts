import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 验证规则
const VALIDATION_RULES = {
  communityName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-]+$/,
  },
  buildingNumber: {
    required: true,
    pattern: /^([1-9]\d{0,2}|[A-Z])$/,
  },
  unitNumber: {
    required: true,
    pattern: /^[1-9]\d?$/,
  },
  roomNumber: {
    required: true,
    pattern: /^\d{1,4}$/,
  },
  introduction: {
    required: false,
    maxLength: 500,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { error: authError, data: authData } = await getAuthUser();
    if (authError || !authData?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { communityName, buildingNumber, unitNumber, roomNumber, introduction } = body;

    // 验证必填字段
    const validationError = validateField(communityName, 'communityName', VALIDATION_RULES.communityName);
    if (validationError) return NextResponse.json({ error: validationError, field: 'communityName' }, { status: 400 });

    const buildingError = validateField(buildingNumber, 'buildingNumber', VALIDATION_RULES.buildingNumber);
    if (buildingError) return NextResponse.json({ error: buildingError, field: 'buildingNumber' }, { status: 400 });

    const unitError = validateField(unitNumber, 'unitNumber', VALIDATION_RULES.unitNumber);
    if (unitError) return NextResponse.json({ error: unitError, field: 'unitNumber' }, { status: 400 });

    const roomError = validateField(roomNumber, 'roomNumber', VALIDATION_RULES.roomNumber);
    if (roomError) return NextResponse.json({ error: roomError, field: 'roomNumber' }, { status: 400 });

    if (introduction && introduction.length > VALIDATION_RULES.introduction.maxLength) {
      return NextResponse.json({ error: '自我介绍不超过 500 字', field: 'introduction' }, { status: 400 });
    }

    // 使用 Service Role Key 写入数据库
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

    // 检查是否已存在
    const { data: existing } = await supabaseAdmin
      .from('neighbor_profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: '已提交过认证信息，如需修改请联系管理员' }, { status: 400 });
    }

    // 插入数据
    const { data, error } = await supabaseAdmin
      .from('neighbor_profiles')
      .insert({
        user_id: authData.user.id,
        community_name: communityName,
        building_number: buildingNumber,
        unit_number: unitNumber,
        room_number: roomNumber,
        introduction: introduction || null,
        verification_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        verificationStatus: data.verification_status,
      }
    });
  } catch (error: any) {
    console.error('Error creating neighbor profile:', error);
    return NextResponse.json(
      { error: error.message || '提交失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { error: authError, data: authData } = await getAuthUser();
    if (authError || !authData?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('neighbor_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data: data ? {
        communityName: data.community_name,
        buildingNumber: data.building_number,
        unitNumber: data.unit_number,
        roomNumber: data.room_number,
        introduction: data.introduction,
        verificationStatus: data.verification_status,
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching neighbor profile:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// 辅助函数
async function getAuthUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return supabase.auth.getUser();
}

function validateField(value: any, fieldName: string, rules: any): string | null {
  if (rules.required && (!value || value.trim() === '')) {
    return '此字段为必填项';
  }
  if (value && rules.minLength && value.length < rules.minLength) {
    return `至少${rules.minLength}个字符`;
  }
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `不超过${rules.maxLength}个字符`;
  }
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return '格式不正确';
  }
  return null;
}
