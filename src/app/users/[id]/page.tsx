"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider } from "@/components/ui/toast";
import FollowButton from "@/components/follow-button";
import PostCard from "@/components/post-card";

interface User {
  id: string;
  nickname: string;
  avatar?: string;
  role: string;
  created_at: string;
}

interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
}

function UserProfileContentInner() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user:', userId);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [userRes, statsRes, postsRes] = await Promise.all([
        fetch(`/api/users/${userId}`, { headers: headers as Record<string, string> }),
        fetch(`/api/users/${userId}/stats`, { headers: headers as Record<string, string> }),
        fetch(`/api/posts?user_id=${userId}`, { headers: headers as Record<string, string> }),
      ]);

      console.log('User response status:', userRes.status);
      console.log('Stats response status:', statsRes.status);
      console.log('Posts response status:', postsRes.status);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const postsData = await postsRes.json();

      console.log('User data:', userData);
      console.log('Stats data:', statsData);
      console.log('Posts data:', postsData);

      if (userRes.status === 404) {
        setUser(null);
        return;
      }

      setUser(userData);
      setStats(statsData);
      setPosts(postsData.posts || postsData || []);
    } catch (error) {
      console.error('Fetch user data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-6">
          <Skeleton className="h-64 rounded-lg mb-6" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-xl font-bold mb-2">用户不存在</h1>
            <Link href="/" className="text-primary hover:underline">
              返回首页
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-6">
        {/* 用户资料卡片 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {/* 头像 */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nickname}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                  {user.nickname[0]?.toUpperCase()}
                </div>
              )}

              {/* 信息 */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold">{user.nickname}</h1>
                    <p className="text-sm text-muted-foreground">
                      加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <FollowButton targetUserId={user.id} size="lg" />
                </div>

                {/* 统计 */}
                {stats && (
                  <div className="flex gap-6 mt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{stats.posts_count}</div>
                      <div className="text-sm text-muted-foreground">帖子</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{stats.followers_count}</div>
                      <div className="text-sm text-muted-foreground">粉丝</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{stats.following_count}</div>
                      <div className="text-sm text-muted-foreground">关注</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户帖子 */}
        <h2 className="text-xl font-bold mb-4">TA 的帖子</h2>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => {}}
                isLiked={false}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-muted-foreground">暂无帖子</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function UserProfileContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <UserProfileContentInner />
    </Suspense>
  );
}

export default function UserProfilePage() {
  return (
    <ToastProvider>
      <UserProfileContent />
    </ToastProvider>
  );
}
