"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavBarProps {
  user?: {
    nickname?: string;
    avatar?: string;
  } | null;
  onSignOut?: () => void;
}

export function NavBar({ user, onSignOut }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* 左侧：Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">美邻网</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              首页
            </Link>
            <Link
              href="/discover"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              发现
            </Link>
            {user && (
              <Link
                href="/messages"
                className="transition-colors hover:text-foreground/80 text-muted-foreground"
              >
                消息
              </Link>
            )}
          </nav>
        </div>

        {/* 右侧：用户操作 */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  控制台
                </Button>
              </Link>
              <Avatar className="h-8 w-8 cursor-pointer" role="button" aria-label="用户菜单">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user.nickname?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="hidden sm:inline-flex"
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
