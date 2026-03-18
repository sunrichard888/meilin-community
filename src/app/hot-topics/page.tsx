"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function HotTopicsContent() {
  // 占位数据
  const topics = [
    { id: 1, name: "邻里互助", count: 234, posts: 1234, trend: "up" },
    { id: 2, name: "二手交易", count: 189, posts: 987, trend: "up" },
    { id: 3, name: "美食推荐", count: 156, posts: 765, trend: "stable" },
    { id: 4, name: "宠物交流", count: 134, posts: 654, trend: "up" },
    { id: 5, name: "育儿经验", count: 123, posts: 543, trend: "down" },
    { id: 6, name: "健身运动", count: 98, posts: 432, trend: "stable" },
    { id: 7, name: "旅游分享", count: 87, posts: 321, trend: "up" },
    { id: 8, name: "房产讨论", count: 76, posts: 210, trend: "down" },
  ];

  const relatedPosts = [
    { id: 1, title: "小区门口新开了一家早餐店，味道不错！", author: "张三", likes: 45 },
    { id: 2, title: "转让闲置儿童自行车，9 成新", author: "李四", likes: 23 },
    { id: 3, title: "周末有邻居一起去爬山吗？", author: "王五", likes: 67 },
    { id: 4, title: "推荐一家靠谱的宠物医院", author: "赵六", likes: 89 },
    { id: 5, title: "小区停车位紧张，大家有什么建议？", author: "钱七", likes: 156 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">热门话题</h1>
        </div>
      </header>

      <div className="container py-6">
        {/* 话题标签云 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">🔥 热门话题榜</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{topic.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {topic.trend === 'up' && '📈'}
                      {topic.trend === 'down' && '📉'}
                      {topic.trend === 'stable' && '➡️'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{topic.count} 人参与</div>
                    <div>{topic.posts} 篇帖子</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 相关帖子推荐 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">📝 热门帖子推荐</h2>
            <div className="space-y-3">
              {relatedPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">{post.title}</div>
                    <div className="text-xs text-muted-foreground">
                      作者：{post.author}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      ❤️ {post.likes}
                    </span>
                    <Button variant="ghost" size="sm">
                      查看详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 功能预告 */}
        <Card className="mt-8">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-sm">
              话题详情和帖子筛选功能即将上线...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HotTopicsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <HotTopicsContent />
    </Suspense>
  );
}
