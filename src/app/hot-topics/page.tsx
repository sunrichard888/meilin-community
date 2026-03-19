"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TopicStats {
  category: string;
  label: string;
  emoji: string;
  count: number;
  posts: number;
  likes: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
}

interface HotPost {
  id: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
  category: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  emergency: { label: '紧急通知', emoji: '🚨' },
  marketplace: { label: '二手闲置', emoji: '🏪' },
  help: { label: '邻里互助', emoji: '🆘' },
  event: { label: '社区活动', emoji: '🎉' },
  pets: { label: '宠物交友', emoji: '🐕' },
  food: { label: '美食分享', emoji: '🍳' },
};

export default function HotTopicsPage() {
  const [topics, setTopics] = useState<TopicStats[]>([]);
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsRes, postsRes] = await Promise.all([
        fetch('/api/hot-topics'),
        fetch('/api/posts/hot?limit=5'),
      ]);

      const topicsData = await topicsRes.json();
      const postsData = await postsRes.json();

      setTopics(topicsData);
      setHotPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch hot topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">热门话题</h1>
          </div>
        </header>
        <div className="container py-6">
          <Card className="mb-8">
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">← 返回</Link>
          <h1 className="text-xl font-bold">热门话题</h1>
        </div>
      </header>

      <div className="container py-6">
        {/* 话题标签云 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">🔥 热门话题榜</h2>
            {topics.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                  <Link
                    key={topic.category}
                    href={`/feed?category=${topic.category}`}
                    className="block p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{topic.emoji}</span>
                        <h3 className="font-semibold">{topic.label}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {topic.trend === 'up' && '📈'}
                        {topic.trend === 'down' && '📉'}
                        {topic.trend === 'stable' && '➡️'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{topic.count} 人参与</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          #{topic.rank}
                        </span>
                      </div>
                      <div>{topic.posts} 篇帖子</div>
                      <div>❤️ {topic.likes} 次点赞</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📭</div>
                <p>暂无话题数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 热门帖子推荐 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">📝 热门帖子推荐</h2>
            {hotPosts.length > 0 ? (
              <div className="space-y-3">
                {hotPosts.map((post) => {
                  const categoryInfo = CATEGORY_LABELS[post.category] || { label: '其他', emoji: '📌' };
                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {categoryInfo.emoji} {categoryInfo.label}
                          </span>
                          <div className="font-medium">{post.title}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          作者：{post.author}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            ❤️ {post.likes}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            💬 {post.comments}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          查看详情
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📭</div>
                <p>暂无热门帖子</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分类快速入口 */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">📂 按分类浏览</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(CATEGORY_LABELS).map(([category, { label, emoji }]) => (
                <Link
                  key={category}
                  href={`/feed?category=${category}`}
                  className="text-center p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className="text-sm font-medium">{label}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
