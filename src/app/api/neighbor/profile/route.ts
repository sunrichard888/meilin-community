import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // 使用 Service Role Key 绕过 RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error('[POST Neighbor Profile] No auth header');
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 验证 token 获取用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[POST Neighbor Profile] Auth error:', authError);
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { communityName, buildingNumber, unitNumber, roomNumber, introduction } = body;

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

    // 检查是否已存在
    const { data: existing } = await supabase
      .from('neighbor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: '已提交过认证信息，如需修改请联系管理员' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('neighbor_profiles')
      .insert({
        user_id: user.id,
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
    console.error('[POST Neighbor Profile] Error:', error);
    return NextResponse.json(
      { error: error.message || '提交失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 使用 Service Role Key 绕过 RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 验证 token 获取用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[GET Neighbor Profile] Auth error:', authError);
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('neighbor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
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
    console.error('[GET Neighbor Profile] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

function validateField(value: any, fieldName: string, rules: any): string | null {
  if (rules.required && (!value || value.trim() === '')) {
    return '此字段为必填项';
  }
  if (!value) return null;
  if (rules.minLength && value.length < rules.minLength) {
    return `至少${rules.minLength}个字符`;
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    return `不超过${rules.maxLength}个字符`;
  }
  if (rules.pattern && !rules.pattern.test(value)) {
    return '格式不正确';
  }
  return null;
}
