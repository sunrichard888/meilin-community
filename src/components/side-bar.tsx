"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface HotTopic {
  icon: string;
  title: string;
  count: number;
  category?: string;
}

const defaultHotTopics: HotTopic[] = [
  { icon: "🔥", title: "全部帖子", count: 0 },
  { icon: "🏪", title: "二手闲置", count: 0 },
  { icon: "🆘", title: "邻里互助", count: 0 },
  { icon: "🎉", title: "社区活动", count: 0 },
  { icon: "🐕", title: "宠物交友", count: 0 },
];

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
}

const categoryIcons: Record<string, string> = {
  notice: "📢",
  event: "🎉",
  safety: "⚠️",
  other: "📌",
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  return `${Math.floor(seconds / 86400)}天前`;
}

export function SideBar() {
  const [hotTopics, setHotTopics] = useState<HotTopic[]>(defaultHotTopics);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotTopics();
    fetchAnnouncements();
  }, []);

  const fetchHotTopics = async () => {
    try {
      const response = await fetch('/api/posts/categories');
      const data = await response.json();
      
      if (response.ok && data.categories) {
        // 映射 API 数据到显示格式
        const categoryIcons: Record<string, string> = {
          all: "🔥",
          marketplace: "🏪",
          help: "🆘",
          event: "🎉",
          pets: "🐕",
          emergency: "🚨",
          notice: "📢",
        };

        const categoryNames: Record<string, string> = {
          all: "全部帖子",
          marketplace: "二手闲置",
          help: "邻里互助",
          event: "社区活动",
          pets: "宠物交友",
          emergency: "紧急通知",
          notice: "公告通知",
        };

        const topics: HotTopic[] = data.categories.map((cat: any) => ({
          icon: categoryIcons[cat.category] || "📌",
          title: categoryNames[cat.category] || cat.category,
          count: cat.count,
          category: cat.category,
        }));

        // 确保至少有默认数据
        if (topics.length > 0) {
          setHotTopics(topics.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('获取热门话题失败:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      const data = await response.json();
      
      if (response.ok) {
        // 只取前 3 条公告
        setAnnouncements((data || []).slice(0, 3));
      }
    } catch (error) {
      console.error('获取公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="hidden lg:block w-80 space-y-4">
      {/* 热门话题 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            🔥 热门话题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {hotTopics.map((topic, i) => (
            <Link
              key={i}
              href={`/hot-topics`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{topic.icon}</span>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {topic.title}
                </span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {topic.count}
              </span>
            </Link>
          ))}
          {/* 查看更多 */}
          <div className="pt-2 mt-2 border-t">
            <Link
              href="/hot-topics"
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
            >
              查看更多话题
              <span className="text-xs">→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 社区公告 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            📢 社区公告
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">加载中...</p>
            </div>
          ) : announcements.length > 0 ? (
            announcements.map((item, i) => (
              <Link
                key={item.id}
                href="/announcements"
                className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">
                    {categoryIcons[item.category] || "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.is_pinned && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                          置顶
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.content}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-xs">暂无公告</p>
            </div>
          )}
          {/* 查看更多 */}
          <div className="pt-2 mt-2 border-t">
            <Link
              href="/announcements"
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
            >
              查看更多公告
              <span className="text-xs">→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 社区统计 */}
      <CommunityStatsCard />
    </aside>
  );
}

// 社区统计卡片组件
function CommunityStatsCard() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    postsToday: 0,
    totalPosts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/community-stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats({
          activeUsers: data.activeUsers7d || 0,
          postsToday: data.postsToday || 0,
          totalPosts: data.totalPosts || 0,
          totalUsers: data.totalUsers || 0,
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Link href="/community-stats">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              📊 社区概况
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">加载中...</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href="/community-stats">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            📊 社区概况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="text-2xl font-bold text-primary">
                {stats.activeUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                7 日活跃
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <div className="text-2xl font-bold text-accent-foreground">
                {stats.postsToday}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                今日发帖
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalPosts.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                总帖子数
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                总用户数
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
