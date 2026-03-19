"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePosts } from "@/lib/hooks";
import { NavBar } from "@/components/nav-bar";
import { SideBar } from "@/components/side-bar";
import PostComposer from "@/components/post-composer";
import PostCard from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";

// 分类定义
const CATEGORIES = [
  { id: 'all', label: '全部', emoji: '' },
  { id: 'emergency', label: '紧急通知', emoji: '🚨' },
  { id: 'marketplace', label: '二手闲置', emoji: '🏪' },
  { id: 'help', label: '邻里互助', emoji: '🆘' },
  { id: 'event', label: '社区活动', emoji: '🎉' },
  { id: 'pets', label: '宠物交友', emoji: '🐕' },
  { id: 'food', label: '美食分享', emoji: '🍳' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

// 从内容中自动识别分类
function detectCategory(content: string): CategoryId {
  const text = content.toLowerCase();
  if (text.includes('通知') || text.includes('紧急') || text.includes('公告')) return 'emergency';
  if (text.includes('闲置') || text.includes('转让') || text.includes('出售') || text.includes('二手')) return 'marketplace';
  if (text.includes('互助') || text.includes('求助') || text.includes('帮忙') || text.includes('拼车')) return 'help';
  if (text.includes('活动') || text.includes('报名') || text.includes('聚会') || text.includes('美食节')) return 'event';
  if (text.includes('宠物') || text.includes('狗') || text.includes('猫') || text.includes('交友')) return 'pets';
  if (text.includes('美食') || text.includes('食谱') || text.includes('做菜') || text.includes('餐厅')) return 'food';
  return 'all';
}

function HomeContent() {
  const { user, signOut } = useAuth();
  const { posts, loading, addPost, likePost } = usePosts();
  const { showToast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // 根据分类筛选帖子
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory || (!post.category && detectCategory(post.content) === selectedCategory));

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <NavBar user={user} onSignOut={signOut} />

      <div className="container py-6">
        <div className="flex gap-6">
          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {/* 欢迎横幅 */}
            {user && (
              <Card className="mb-6 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">👋</div>
                      <div>
                        <h2 className="text-lg font-semibold">
                          你好，{user.nickname || "邻居"}！
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          分享邻里趣事，共建温暖社区
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 发布框 */}
            {user && (
              <PostComposer />
            )}

            {/* 内容分类标签 */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {category.emoji && <span className="mr-1">{category.emoji}</span>}
                  {category.label}
                </button>
              ))}
            </div>

            {/* 帖子列表 */}
            <div className="space-y-4">
              {loading ? (
                // 骨架屏加载状态
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                      <Skeleton className="h-48 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredPosts.length === 0 ? (
                // 空状态
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedCategory === 'all' 
                        ? (user ? "暂无动态" : "欢迎来到美邻网")
                        : `暂无"${CATEGORIES.find(c => c.id === selectedCategory)?.label}"类帖子`
                      }
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedCategory === 'all'
                        ? (user ? "快来发布第一条邻里动态吧！" : "连接你与邻居的社交平台，加入你的社区")
                        : `试试切换到其他分类，或发布一篇"${CATEGORIES.find(c => c.id === selectedCategory)?.label}"类帖子`
                      }
                    </p>
                    {selectedCategory === 'all' && !user && (
                      <div className="flex gap-2 justify-center">
                        <a href="/login">
                          <button className="px-4 py-2 rounded-lg border font-medium hover:bg-muted transition-colors">
                            登录
                          </button>
                        </a>
                        <a href="/register">
                          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                            注册
                          </button>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                // 帖子列表
                filteredPosts.map((post) => (
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

          {/* 侧边栏 */}
          <SideBar />
        </div>
      </div>
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
