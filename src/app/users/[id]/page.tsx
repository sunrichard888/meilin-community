"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/follow-button";
import PostCard from "@/components/post-card";

interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  created_at: string;
  follows_count: number;
  followers_count: number;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  user?: {
    nickname: string;
    avatar?: string;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  useEffect(() => {
    if (params.id) {
      loadUserProfile(params.id as string);
    }
  }, [params.id]);

  const loadUserProfile = async (userId: string) => {
    try {
      // 获取用户信息
      const supabase = require('@supabase/supabase-js').createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('获取用户信息失败:', userError);
        return;
      }

      setProfile(userData);

      // 获取用户的帖子
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user:users (
            nickname,
            avatar
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!postsError && postsData) {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">用户不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-xl font-bold">{profile.nickname} 的主页</h1>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* 左侧：用户信息 */}
          <aside className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* 头像 */}
                  <div className="mb-4">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.nickname}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                          {profile.nickname[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* 昵称 */}
                  <h2 className="text-xl font-bold mb-2">{profile.nickname}</h2>

                  {/* 加入时间 */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {new Date(profile.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} 加入
                  </p>

                  {/* 统计信息 */}
                  <div className="flex gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{profile.follows_count || 0}</div>
                      <div className="text-xs text-muted-foreground">关注</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{profile.followers_count || 0}</div>
                      <div className="text-xs text-muted-foreground">粉丝</div>
                    </div>
                  </div>

                  {/* 关注按钮 */}
                  <FollowButton userId={profile.id} />
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* 右侧：内容 */}
          <main className="md:col-span-2">
            {/* Tab 切换 */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                TA 的帖子
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                关于
              </button>
            </div>

            {/* 帖子列表 */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      暂无帖子
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* 关于 */}
            {activeTab === 'about' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">基本信息</h3>
                      <p className="text-sm text-muted-foreground">
                        美邻网社区成员，{new Date(profile.created_at).toLocaleDateString('zh-CN', { year: 'numeric' })} 年加入。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
