"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AnnouncementsContent() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 占位数据
  const announcements = [
    {
      id: 1,
      title: "🎉 美邻网上线公告",
      content: "亲爱的邻居们，美邻网社区平台正式上线啦！我们致力于打造一个温馨和谐的邻里交流平台，让大家能够更好地互帮互助、分享生活。欢迎加入！",
      author: "管理员",
      publishedAt: "2026-03-15",
      isPinned: true,
    },
    {
      id: 2,
      title: "📋 社区规范发布",
      content: "为了维护良好的社区秩序，我们制定了以下社区规范：1. 文明发言，友善交流；2. 禁止发布广告和虚假信息；3. 尊重他人隐私；4. 遇到问题及时举报。请大家共同遵守！",
      author: "管理员",
      publishedAt: "2026-03-16",
      isPinned: true,
    },
    {
      id: 3,
      title: "🏘️ 小区活动征集",
      content: "为丰富社区文化生活，现向全体居民征集社区活动创意。无论是亲子活动、运动比赛、还是兴趣小组，都欢迎提出宝贵建议！",
      author: "居委会",
      publishedAt: "2026-03-17",
      isPinned: false,
    },
    {
      id: 4,
      title: "🔒 安全提示：谨防电信诈骗",
      content: "近期电信诈骗案件频发，请大家提高警惕：1. 不轻信陌生电话；2. 不随意点击不明链接；3. 不向陌生账户转账；4. 遇到可疑情况及时报警。",
      author: "社区民警",
      publishedAt: "2026-03-18",
      isPinned: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">社区公告</h1>
        </div>
      </header>

      <div className="container py-6">
        {/* 公告列表 */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="pt-6">
                <div className="mb-3">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isPinned && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            📌 置顶
                          </span>
                        )}
                        <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                          {announcement.title}
                        </h2>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>发布：{announcement.author}</span>
                        <span className="mx-2">•</span>
                        <span>时间：{announcement.publishedAt}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(expandedId === announcement.id ? null : announcement.id);
                      }}
                    >
                      {expandedId === announcement.id ? '收起' : '展开'}
                    </Button>
                  </div>

                  {/* 公告内容 */}
                  {(expandedId === announcement.id || announcement.isPinned) && (
                    <div className="prose max-w-none pt-4 border-t mt-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                  )}
                </div>

                {/* 公告内容 */}
                {(expandedId === announcement.id || announcement.isPinned) && (
                  <div className="prose max-w-none pt-4 border-t">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 发布入口（管理员） */}
        <div className="mt-8 text-center">
          <Button variant="outline" disabled>
            📝 发布新公告（管理员）
          </Button>
        </div>

        {/* 功能预告 */}
        <Card className="mt-8">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-sm">
              公告订阅和推送功能即将上线...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <AnnouncementsContent />
    </Suspense>
  );
}
