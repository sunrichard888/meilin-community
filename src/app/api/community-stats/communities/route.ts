import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 按小区统计（需要 neighbor_profiles 表有 community_name）
    const { data: profiles } = await supabase
      .from('neighbor_profiles')
      .select('community_name, user_id');

    if (!profiles || profiles.length === 0) {
      // 如果没有小区数据，返回空数组
      return NextResponse.json([]);
    }

    // 按小区分组统计
    const communityMap = new Map<string, { users: Set<string>, posts: number }>();

    profiles.forEach((profile) => {
      if (profile.community_name) {
        if (!communityMap.has(profile.community_name)) {
          communityMap.set(profile.community_name, { users: new Set(), posts: 0 });
        }
        const community = communityMap.get(profile.community_name)!;
        community.users.add(profile.user_id);
      }
    });

    // 获取每个小区的帖子数
    const { data: posts } = await supabase
      .from('posts')
      .select('user_id, community_name');

    posts?.forEach((post) => {
      if (post.community_name && communityMap.has(post.community_name)) {
        communityMap.get(post.community_name)!.posts += 1;
      }
    });

    // 转换为数组并排序
    const communities = Array.from(communityMap.entries())
      .map(([name, data], index) => ({
        name,
        users: data.users.size,
        posts: data.posts,
        rank: index + 1,
      }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 10);

    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json({ error: 'Failed to fetch community stats' }, { status: 500 });
  }
}
