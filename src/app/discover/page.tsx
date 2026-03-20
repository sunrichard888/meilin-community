"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ToastProvider } from "@/components/ui/toast";
import Link from "next/link";
import LikeButton from "@/components/like-button";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  community_name?: string;
  building_number?: string;
  is_pinned: boolean;
  created_at: string;
  user?: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'featured'>('hot');

  useEffect(() => {
    loadPosts(activeTab);
  }, [activeTab]);

  const loadPosts = async (tab: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      let url = '/api/posts';
      
      if (tab === 'hot') {
        url = '/api/posts/hot?limit=20';
      } else if (tab === 'new') {
        url = '/api/posts?limit=20';
      } else {
        // featured 暂时也用热门数据
        url = '/api/posts/hot?limit=20';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPosts(result.data || []);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">发现</h1>
        </div>
      </header>

      <div className="container py-6">
        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('hot')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'hot'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔥 热门
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'new'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🆕 最新
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'featured'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⭐ 精选
          </button>
        </div>

        {/* 帖子列表 */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    {/* 作者信息 */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {post.user?.avatar ? (
                            <img src={post.user.avatar} alt={post.user.nickname} className="w-full h-full object-cover" />
                          ) : (
                            post.user?.nickname?.[0]?.toUpperCase() || '?'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {post.user?.nickname || '匿名用户'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      {post.is_pinned && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          📌 置顶
                        </span>
                      )}
                    </div>

                    {/* 帖子内容 */}
                    <p className="text-base mb-3 line-clamp-3">
                      {post.content}
                    </p>

                    {/* 图片预览 */}
                    {post.images && post.images.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-hidden">
                        {post.images.slice(0, 3).map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`图片 ${index + 1}`}
                            className="w-20 h-20 rounded object-cover flex-shrink-0"
                          />
                        ))}
                      </div>
                    )}

                    {/* 互动数据 */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {post.community_name && (
                          <span>📍 {post.community_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <LikeButton postId={post.id} likesCount={post.likes_count} />
                        <span className="text-sm text-muted-foreground">
                          💬 {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">暂无内容</h3>
              <p className="text-muted-foreground">
                还没有{activeTab === 'hot' ? '热门' : activeTab === 'new' ? '最新' : '精选'}帖子
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DiscoverPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}

export default function DiscoverPage() {
  return (
    <ToastProvider>
      <DiscoverPageWithSuspense />
    </ToastProvider>
  );
}
