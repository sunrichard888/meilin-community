"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { usePosts } from "@/lib/hooks";
import { NavBar } from "@/components/nav-bar";
import { SideBar } from "@/components/side-bar";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";

// 示例帖子数据（冷启动用）
const samplePosts: any[] = [
  {
    id: "sample-1",
    user_id: "sample-user-1",
    content: "大家好！我是 3 栋的新邻居，刚搬来不久。很高兴加入美邻网，以后请多多关照！👋 有什么社区活动记得叫我~",
    images: [],
    likes_count: 24,
    comments_count: 8,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      nickname: "阳光花园 3 栋",
      avatar: null,
    },
  },
  {
    id: "sample-2",
    user_id: "sample-user-2",
    content: "【闲置转让】出一台九成新微波炉，买来没用几次，50 元自取。有需要的邻居私信我！📍5 栋 1 单元",
    images: ["https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=400"],
    likes_count: 12,
    comments_count: 3,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: {
      nickname: "热心邻居老王",
      avatar: null,
    },
  },
  {
    id: "sample-3",
    user_id: "sample-user-3",
    content: "【邻里互助】明天上午要去山姆会员店，有要一起拼车的邻居吗？我开 SUV，还能坐 3 个人~ 🚗",
    images: [],
    likes_count: 18,
    comments_count: 11,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    user: {
      nickname: "爱分享的李姐",
      avatar: null,
    },
  },
  {
    id: "sample-4",
    user_id: "sample-user-4",
    content: "【宠物交友】我家金毛「豆豆」想找小伙伴一起玩！每天傍晚会在小区花园，有同样养狗的邻居可以加我微信~ 🐕",
    images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"],
    likes_count: 45,
    comments_count: 16,
    created_at: new Date(Date.now() - 28800000).toISOString(),
    user: {
      nickname: "豆豆妈",
      avatar: null,
    },
  },
  {
    id: "sample-5",
    user_id: "sample-user-5",
    content: "【社区活动】本周六下午 3 点，小区广场举办「邻里美食节」，欢迎大家带上自家拿手菜来分享！🍲 报名接龙：1. 张阿姨 - 红烧肉 2. ...",
    images: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
    ],
    likes_count: 67,
    comments_count: 28,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user: {
      nickname: "业委会 - 小陈",
      avatar: null,
    },
  },
];

function HomeContent() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { posts, loading, addPost, likePost } = usePosts();
  const { showToast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showWelcome, setShowWelcome] = useState(false);

  // 登录成功后显示欢迎 Toast
  useEffect(() => {
    if (user && !authLoading) {
      setShowWelcome(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (showWelcome && user) {
      showToast(`欢迎回来，${user.nickname || '邻居'}！👋`, 'success');
      setShowWelcome(false);
    }
  }, [showWelcome, user, showToast]);

  // 合并示例帖子和真实帖子
  const allPosts = posts.length > 0 ? posts : samplePosts;

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
              <PostComposer onAddPost={handleAddPost} userNickname={user.nickname} />
            )}

            {/* 内容分类标签 */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap">
                全部
              </button>
              <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium whitespace-nowrap transition-colors">
                🚨 紧急通知
              </button>
              <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium whitespace-nowrap transition-colors">
                🏪 二手闲置
              </button>
              <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium whitespace-nowrap transition-colors">
                🆘 邻里互助
              </button>
              <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium whitespace-nowrap transition-colors">
                🎉 社区活动
              </button>
              <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium whitespace-nowrap transition-colors">
                🐕 宠物交友
              </button>
              <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-sm font-medium whitespace-nowrap transition-colors">
                🍳 美食分享
              </button>
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
              ) : allPosts.length === 0 ? (
                // 空状态
                <Card>
                  <CardContent className="text-center py-12">
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
                allPosts.map((post) => (
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
