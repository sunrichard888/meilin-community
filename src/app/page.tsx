"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePosts } from "@/lib/hooks";
import { NavBar } from "@/components/nav-bar";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";

function HomeContent() {
  const { user, signOut } = useAuth();
  const { posts, loading, addPost, likePost } = usePosts();
  const { showToast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleAddPost = async (content: string) => {
    try {
      await addPost(content);
      showToast("发布成功！", "success");
    } catch (error) {
      showToast("发布失败，请重试", "error");
    }
  };

  const handleLikePost = async (id: string) => {
    const wasLiked = likedPosts.has(id);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    try {
      await likePost(id);
    } catch {
      // 失败时回滚
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      showToast("点赞失败", "error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} onSignOut={signOut} />

      <main className="container py-6">
        {/* 发布框 */}
        {user && (
          <PostComposer onAddPost={handleAddPost} userNickname={user.nickname} />
        )}

        {/* 动态列表 */}
        <div className="space-y-4">
          {loading ? (
            // 骨架屏加载状态
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))
          ) : posts.length === 0 ? (
            // 空状态
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold mb-2">
                {user ? "暂无动态" : "欢迎来到美邻网"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {user
                  ? "快来发布第一条邻里动态吧！"
                  : "连接你与邻居的社交平台，加入你的社区"}
              </p>
              {!user && (
                <div className="flex gap-2 justify-center">
                  <a href="/login">
                    <button className="px-4 py-2 rounded-md border">登录</button>
                  </a>
                  <a href="/register">
                    <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
                      注册
                    </button>
                  </a>
                </div>
              )}
            </div>
          ) : (
            // 帖子列表
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLikePost}
                isLiked={likedPosts.has(post.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
