"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider } from "@/components/ui/toast";

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  postsToday: number;
  totalReports: number;
  pendingReports: number;
  activeUsers7d: number;
}

interface HotPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  user: {
    nickname: string;
  };
}

function AdminDashboardInner() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { getCurrentToken } = await import('@/lib/auth-check');
      const token = await getCurrentToken();
      
      if (!token) {
        window.location.href = '/login?redirect=/admin/dashboard';
        return;
      }

      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

      const [statsRes, postsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: headers as Record<string, string> }),
        fetch('/api/admin/hot-posts', { headers: headers as Record<string, string> }),
      ]);

      if (statsRes.status === 401 || postsRes.status === 401) {
        window.location.href = '/login?redirect=/admin/dashboard';
        return;
      }

      const statsData = await statsRes.json();
      const postsData = await postsRes.json();

      setStats(statsData);
      setHotPosts(postsData.posts || []);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">正在跳转登录...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">📊 管理后台</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin/users" className="text-sm font-medium hover:text-primary">
              用户管理
            </Link>
            <Link href="/admin/moderation" className="text-sm font-medium hover:text-primary">
              内容审核
            </Link>
            <Link href="/admin/announcements" className="text-sm font-medium hover:text-primary">
              公告管理
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-6">
        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats?.totalUsers.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">👥 总用户数</div>
                <div className="text-xs text-green-600 mt-1">
                  +{stats?.newUsersToday || 0} 今日新增
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats?.totalPosts.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">📝 总帖子数</div>
                <div className="text-xs text-green-600 mt-1">
                  +{stats?.postsToday || 0} 今日发帖
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats?.pendingReports || 0}
                </div>
                <div className="text-sm text-muted-foreground">⚠️ 待处理举报</div>
                <div className="text-xs text-muted-foreground mt-1">
                  总计：{stats?.totalReports || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats?.activeUsers7d || 0}
                </div>
                <div className="text-sm text-muted-foreground">🔥 7 日活跃用户</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 热门帖子 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">🔥 热门帖子排行</h2>
            {hotPosts.length > 0 ? (
              <div className="space-y-3">
                {hotPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < 3 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.content}</p>
                        <p className="text-xs text-muted-foreground">
                          作者：{post.user.nickname}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>❤️ {post.likes_count}</span>
                      <span>💬 {post.comments_count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📭</div>
                <p>暂无数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <AdminDashboardInner />
    </ToastProvider>
  );
}
