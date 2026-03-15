"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePosts } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default function Home() {
  const { user, signOut } = useAuth();
  const { posts, loading, addPost, likePost } = usePosts();

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">美邻网</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-foreground/80">
                首页
              </Link>
              <Link href="/discover" className="transition-colors hover:text-foreground/80">
                发现
              </Link>
              {user && (
                <Link href="/messages" className="transition-colors hover:text-foreground/80">
                  消息
                </Link>
              )}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">控制台</Button>
                </Link>
                <Button variant="ghost" onClick={signOut}>
                  退出
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">登录</Button>
                </Link>
                <Link href="/register">
                  <Button>注册</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container py-6">
        {/* 发布动态 */}
        {user && (
          <Card className="mb-6 p-4">
            <textarea
              className="w-full resize-none border-0 bg-transparent p-0 text-base focus-visible:outline-none focus-visible:ring-0"
              placeholder="分享你的想法..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  addPost(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <div className="flex justify-end mt-2">
              <Button onClick={() => {
                const textarea = e.currentTarget.querySelector('textarea');
                if (textarea) {
                  addPost(textarea.value);
                  textarea.value = '';
                }
              }}>
                发布
              </Button>
            </div>
          </Card>
        )}

        {/* 动态列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无动态，快来发布第一条吧！
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {post.user?.avatar || post.user?.nickname?.[0] || '?'}
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.user?.nickname || '匿名用户'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {post.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="rounded-lg object-cover h-24 w-full" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePost(post.id)}
                      >
                        👍 {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        💬 {post.comments_count}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
