"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ActivitiesContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">活动</h1>
          </div>
          <Button size="sm">
            🎉 发布活动
          </Button>
        </div>
      </header>

      <div className="container py-6">
        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 border-b">
          <button className="px-4 py-2 font-medium border-b-2 border-primary text-primary">
            进行中
          </button>
          <button className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
            即将开始
          </button>
          <button className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
            已结束
          </button>
        </div>

        {/* 空状态 */}
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">活动即将上线</h3>
            <p className="text-muted-foreground mb-4">
              社区活动发布和报名平台正在建设中...
            </p>
            <div className="text-sm text-muted-foreground">
              敬请期待！
            </div>
          </CardContent>
        </Card>

        {/* 功能预告 */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">🏃</div>
              <h4 className="font-semibold mb-1">运动健身</h4>
              <p className="text-sm text-muted-foreground">
                晨跑、羽毛球、篮球
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
              <h4 className="font-semibold mb-1">亲子活动</h4>
              <p className="text-sm text-muted-foreground">
                亲子游戏、教育分享
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <h4 className="font-semibold mb-1">兴趣爱好</h4>
              <p className="text-sm text-muted-foreground">
                手工、烹饪、读书
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <ActivitiesContent />
    </Suspense>
  );
}
