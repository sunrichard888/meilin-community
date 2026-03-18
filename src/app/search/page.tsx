"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import SearchBar from "@/components/search-bar";

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
  user_nickname?: string;
  user_avatar?: string;
}

interface User {
  id: string;
  nickname: string;
  avatar?: string;
  created_at: string;
  follows_count?: number;
  followers_count?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<{ posts: Post[]; users: User[] }>({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users'>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;

    setLoading(true);
    try {
      const type = activeTab === 'all' ? 'all' : activeTab;
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setResults(result.data);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
          <h1 className="text-xl font-bold">搜索</h1>
        </div>
      </header>

      <div className="container py-6">
        {/* 搜索框 */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索帖子、用户..."
              className="flex-1"
            />
            <Button type="submit">
              🔍 搜索
            </Button>
          </div>
        </form>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => {
              setActiveTab('all');
              if (query) performSearch(query);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => {
              setActiveTab('posts');
              if (query) performSearch(query);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            帖子
          </button>
          <button
            onClick={() => {
              setActiveTab('users');
              if (query) performSearch(query);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            用户
          </button>
        </div>

        {/* 搜索结果 */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">搜索中...</p>
          </div>
        ) : query && (results.posts.length === 0 && results.users.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">未找到相关结果</h3>
              <p className="text-muted-foreground">
                试试其他关键词，或者搜索更通用的内容
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 用户结果 */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">用户</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                            ) : (
                              user.nickname[0]?.toUpperCase()
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{user.nickname}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.followers_count || 0} 粉丝
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 帖子结果 */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">帖子</h2>
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* 头像 */}
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {post.user_avatar ? (
                              <img src={post.user_avatar} alt={post.user_nickname} className="w-full h-full object-cover" />
                            ) : (
                              post.user_nickname?.[0]?.toUpperCase() || '?'
                            )}
                          </AvatarFallback>
                        </Avatar>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{post.user_nickname || '匿名用户'}</span>
                            {post.is_pinned && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                置顶
                              </span>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                            <span>❤️ {post.likes_count}</span>
                            <span>💬 {post.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
