"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

function StatsContent() {
  // 与首页侧边栏一致的数据
  const stats = {
    activeUsers: 1234,     // 活跃邻居
    todayPosts: 56,        // 今日发帖
    ongoingEvents: 12,     // 正在进行活动
    verifiedBusinesses: 8, // 认证商家
  };

  const topCommunities = [
    { name: "美林花园", posts: 1234, rank: 1 },
    { name: "阳光小区", posts: 987, rank: 2 },
    { name: "绿城花园", posts: 765, rank: 3 },
    { name: "和谐家园", posts: 654, rank: 4 },
    { name: "碧桂园", posts: 543, rank: 5 },
  ];

  const topUsers = [
    { name: "张三", posts: 156, rank: 1 },
    { name: "李四", posts: 134, rank: 2 },
    { name: "王五", posts: 123, rank: 3 },
    { name: "赵六", posts: 98, rank: 4 },
    { name: "钱七", posts: 87, rank: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
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
                  {stats.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  👥 活跃邻居
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats.todayPosts}
                </div>
                <div className="text-sm text-muted-foreground">
                  📝 今日发帖
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats.ongoingEvents}
                </div>
                <div className="text-sm text-muted-foreground">
                  🎉 正在进行活动
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats.verifiedBusinesses}
                </div>
                <div className="text-sm text-muted-foreground">
                  🏪 认证商家
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 排行榜 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 热门小区 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">🏘️ 热门小区排行</h2>
              <div className="space-y-3">
                {topCommunities.map((community) => (
                  <Link
                    key={community.rank}
                    href={`/feed?community=${encodeURIComponent(community.name)}`}
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
                    <span className="text-sm text-muted-foreground">
                      {community.posts} 篇帖子
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 活跃用户 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">👥 活跃用户排行</h2>
              <div className="space-y-3">
                {topUsers.map((user) => (
                  <Link
                    key={user.rank}
                    href={`/users/search?name=${encodeURIComponent(user.name)}`}
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
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user.posts} 篇帖子
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能预告 */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">
                🚀 更多详细统计数据即将上线...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CommunityStatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <StatsContent />
    </Suspense>
  );
}
