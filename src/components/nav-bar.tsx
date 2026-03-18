"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface NavBarProps {
  user?: {
    id?: string;
    nickname?: string;
    email?: string;
    avatar?: string;
  } | null;
  onSignOut?: () => void;
}

export function NavBar({ user, onSignOut }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // 获取用户 ID（从 user 对象或 auth）
  const userId = user && 'id' in user ? user.id : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* 左侧：Logo + 导航 */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
              美
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-none">美邻网</div>
              <div className="text-xs text-muted-foreground leading-none mt-1">
                连接你与邻居
              </div>
            </div>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary"
            >
              🏠 首页
            </Link>
            <Link
              href="/discover"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              🧭 发现
            </Link>
            <Link
              href="/activities"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              🎉 活动
            </Link>
            <Link
              href="/market"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              🏪 集市
            </Link>
            {user && (
              <Link
                href="/messages"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                💬 消息
              </Link>
            )}
          </nav>
        </div>

        {/* 右侧：用户操作 */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* 发布按钮（桌面端） */}
              <Button className="hidden sm:inline-flex rounded-full px-4">
                ✏️ 发布
              </Button>

              {/* 通知图标 */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:inline-flex"
                aria-label="通知"
              >
                🔔
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* 用户头像 + 下拉菜单 */}
              <div className="relative">
                <Avatar
                  className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow"
                  role="button"
                  aria-label="用户菜单"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {user.nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <>
                    {/* 点击外部关闭 */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <Card className="absolute right-0 top-12 w-56 p-2 z-50 shadow-lg border-primary/10 animate-scale-in">
                      <div className="p-3 border-b">
                        <p className="font-semibold text-sm truncate">
                          {user.nickname || "新用户"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link 
                          href={userId ? `/users/${userId}` : '/login'} 
                          className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          👤 个人主页
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          ⚙️ 个人设置
                        </Link>
                        <Link 
                          href="/messages" 
                          className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          💬 我的消息
                        </Link>
                        <button 
                          onClick={() => {
                            onSignOut?.();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          🚪 退出登录
                        </button>
                      </div>
                    </Card>
                  </>
                )}
              </div>

              {/* 移动端菜单按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
                aria-label="菜单"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-4">注册</Button>
              </Link>
              {/* 移动端菜单按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
                aria-label="菜单"
              >
                ☰
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-slide-in">
          <nav className="container py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg font-medium bg-primary/10 text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 首页
            </Link>
            <Link
              href="/discover"
              className="block px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              🧭 发现
            </Link>
            <Link
              href="/activities"
              className="block px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              🎉 活动
            </Link>
            <Link
              href="/market"
              className="block px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏪 集市
            </Link>
            {user ? (
              <>
                <Link
                  href={userId ? `/users/${userId}` : '/login'}
                  className="block px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 个人主页
                </Link>
                <Link
                  href="/messages"
                  className="block px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💬 消息
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ 个人设置
                </Link>
                <button
                  onClick={() => {
                    onSignOut?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium text-destructive hover:bg-destructive/10"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1">
                  <button className="w-full px-4 py-3 rounded-lg border font-medium">
                    登录
                  </button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
                    注册
                  </button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
