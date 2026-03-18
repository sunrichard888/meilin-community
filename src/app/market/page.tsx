"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function MarketContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">集市</h1>
          </div>
          <Button size="sm">
            📦 发布物品
          </Button>
        </div>
      </header>

      <div className="container py-6">
        {/* 分类筛选 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button variant="default" size="sm">
            全部
          </Button>
          <Button variant="ghost" size="sm">
            🛒 出售
          </Button>
          <Button variant="ghost" size="sm">
            📢 求购
          </Button>
          <Button variant="ghost" size="sm">
            🎁 免费
          </Button>
          <Button variant="ghost" size="sm">
            📚 书籍
          </Button>
          <Button variant="ghost" size="sm">
            👕 服装
          </Button>
          <Button variant="ghost" size="sm">
            🏠 家居
          </Button>
        </div>

        {/* 空状态 */}
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-semibold mb-2">集市即将开业</h3>
            <p className="text-muted-foreground mb-4">
              邻里二手交易、物品分享平台正在建设中...
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
              <div className="text-4xl mb-2">🛒</div>
              <h4 className="font-semibold mb-1">二手交易</h4>
              <p className="text-sm text-muted-foreground">
                闲置物品转让给邻居
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">📢</div>
              <h4 className="font-semibold mb-1">邻里求购</h4>
              <p className="text-sm text-muted-foreground">
                需要什么问问邻居
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">🎁</div>
              <h4 className="font-semibold mb-1">免费赠送</h4>
              <p className="text-sm text-muted-foreground">
                分享爱心传递温暖
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <MarketContent />
    </Suspense>
  );
}
