"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const hotTopics = [
  { icon: "🔥", title: "本周热门", count: 128 },
  { icon: "🏪", title: "二手闲置", count: 45 },
  { icon: "🆘", title: "邻里互助", count: 32 },
  { icon: "🎉", title: "社区活动", count: 18 },
  { icon: "🐕", title: "宠物交友", count: 24 },
];

const announcements = [
  {
    icon: "📢",
    title: "社区公告",
    content: "欢迎新邻居加入美邻网！",
    time: "1 小时前",
    hot: true,
  },
  {
    icon: "⚠️",
    title: "安全提醒",
    content: "近期请注意防范电信诈骗",
    time: "2 小时前",
    hot: false,
  },
  {
    icon: "🔧",
    title: "停水通知",
    content: "周三上午 9-12 点小区停水",
    time: "1 天前",
    hot: false,
  },
];

export function SideBar() {
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
          {announcements.map((item, i) => (
            <Link
              key={i}
              href="/announcements"
              className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.hot && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        新
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.content}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {item.time}
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
                <div className="text-2xl font-bold text-primary">1,234</div>
                <div className="text-xs text-muted-foreground mt-1">
                  活跃邻居
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                <div className="text-2xl font-bold text-accent-foreground">56</div>
                <div className="text-xs text-muted-foreground mt-1">
                  今日发帖
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-xs text-muted-foreground mt-1">
                  正在进行活动
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-xs text-muted-foreground mt-1">
                  认证商家
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </aside>
  );
}
