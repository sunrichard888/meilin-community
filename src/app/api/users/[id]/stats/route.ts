import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 帖子数
    const { count: posts_count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 粉丝数
    const { count: followers_count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // 关注数
    const { count: following_count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    return NextResponse.json({
      posts_count: posts_count || 0,
      followers_count: followers_count || 0,
      following_count: following_count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
