"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityStats {
  totalUsers: number;
  todayPosts: number;
  ongoingEvents: number;
  verifiedBusinesses: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  postsThisWeek: number;
  postsThisMonth: number;
}

interface CommunityRank {
  name: string;
  posts: number;
  users: number;
  rank: number;
}

interface ActiveUser {
  id: string;
  nickname: string;
  avatar?: string;
  posts: number;
  likes: number;
  rank: number;
}

export default function CommunityStatsPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [communities, setCommunities] = useState<CommunityRank[]>([]);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, communitiesRes, usersRes] = await Promise.all([
        fetch('/api/community-stats/overview'),
        fetch('/api/community-stats/communities'),
        fetch('/api/community-stats/active-users'),
      ]);

      const statsData = await statsRes.json();
      const communitiesData = await communitiesRes.json();
      const usersData = await usersRes.json();

      console.log('Stats data:', statsData);
      console.log('Communities data:', communitiesData);
      console.log('Users data:', usersData);

      setStats(statsData || null);
      setCommunities(communitiesData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(null);
      setCommunities([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">社区概况</h1>
          </div>
        </header>

        <div className="container py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">社区概况</h1>
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
                <div className="text-sm text-muted-foreground">
                  👥 活跃邻居
                </div>
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
                  {stats?.todayPosts || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  📝 今日发帖
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  本周：{stats?.postsThisWeek || 0} 篇
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats?.ongoingEvents || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  🎉 正在进行活动
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  本月：{stats?.postsThisMonth || 0} 篇
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats?.verifiedBusinesses || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  🏪 认证商家
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  总互动：{stats?.totalLikes || 0} 👍
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 总统计 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">📊 总体统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary">{stats?.totalPosts || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">总帖子数</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5">
                <div className="text-2xl font-bold text-accent-foreground">{stats?.totalComments || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">总评论数</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">{stats?.totalLikes || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">总点赞数</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{stats?.newUsersThisWeek || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">本周新增用户</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 排行榜 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 热门小区 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">🏘️ 热门小区排行</h2>
              {communities.length > 0 ? (
                <div className="space-y-3">
                  {communities.map((community) => (
                    <Link
                      key={community.rank}
                      href={`/?community=${encodeURIComponent(community.name)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          community.rank <= 3 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {community.rank}
                        </span>
                        <span className="font-medium">{community.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {community.posts} 篇帖子
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {community.users} 位邻居
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📭</div>
                  <p>暂无小区数据</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 活跃用户 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">👥 活跃用户排行</h2>
              {users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <Link
                      key={user.rank}
                      href={`/users/${user.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          user.rank <= 3 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {user.rank}
                        </span>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.nickname} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.nickname[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{user.nickname}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {user.posts} 篇帖子
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ❤️ {user.likes}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📭</div>
                  <p>暂无用户数据</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 分类统计 */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">📈 分类统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link href="/?category=emergency" className="text-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                <div className="text-2xl mb-1">🚨</div>
                <div className="text-sm font-medium">紧急通知</div>
                <div className="text-xs text-muted-foreground mt-1">待统计</div>
              </Link>
              <Link href="/?category=marketplace" className="text-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="text-2xl mb-1">🏪</div>
                <div className="text-sm font-medium">二手闲置</div>
                <div className="text-xs text-muted-foreground mt-1">待统计</div>
              </Link>
              <Link href="/?category=help" className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="text-2xl mb-1">🆘</div>
                <div className="text-sm font-medium">邻里互助</div>
                <div className="text-xs text-muted-foreground mt-1">待统计</div>
              </Link>
              <Link href="/?category=event" className="text-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                <div className="text-2xl mb-1">🎉</div>
                <div className="text-sm font-medium">社区活动</div>
                <div className="text-xs text-muted-foreground mt-1">待统计</div>
              </Link>
              <Link href="/?category=pets" className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <div className="text-2xl mb-1">🐕</div>
                <div className="text-sm font-medium">宠物交友</div>
                <div className="text-xs text-muted-foreground mt-1">待统计</div>
              </Link>
              <Link href="/?category=food" className="text-center p-4 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors">
                <div className="text-2xl mb-1">🍳</div>
                <div className="text-sm font-medium">美食分享</div>
                <div className="text-xs text-muted-foreground mt-1">待统计</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
