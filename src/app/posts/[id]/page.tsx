"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ToastProvider } from "@/components/ui/toast";
import Link from "next/link";
import LikeButton from "@/components/like-button";
import CommentsSection from "@/components/comments-section";
import ImageLightbox from "@/components/image-lightbox";
import ReportButton from "@/components/report-button";

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

function PostContent() {
  const params = useParams();
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  useEffect(() => {
    if (params.id) {
      loadPost(params.id as string);
    }
  }, [params.id]);

  const loadPost = async (postId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPost(result.data);
      } else {
        console.error('加载帖子失败:', result.error);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (src: string) => {
    setLightboxImage(src);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold mb-2">帖子不存在</h3>
            <p className="text-muted-foreground mb-4">
              该帖子可能已被删除或从未存在
            </p>
            <Button onClick={() => router.push('/feed')}>
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">帖子详情</h1>
        </div>
      </header>

      <div className="container py-6 max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            {/* 作者信息 */}
            <div className="flex items-start justify-between mb-4">
              <Link href={`/users/${post.user_id}`} className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {post.user_avatar ? (
                      <img src={post.user_avatar} alt={post.user_nickname} className="w-full h-full object-cover" />
                    ) : (
                      post.user_nickname?.[0]?.toUpperCase() || '?'
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{post.user_nickname || '匿名用户'}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              </Link>
              {post.is_pinned && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  📌 置顶
                </span>
              )}
            </div>

            {/* 帖子内容 */}
            <div className="prose max-w-none mb-4">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* 图片 */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {post.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`图片 ${index + 1}`}
                    className="rounded-lg aspect-square object-cover hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => openLightbox(img)}
                  />
                ))}
              </div>
            )}

            {/* 图片放大预览 */}
            {lightboxOpen && (
              <ImageLightbox
                src={lightboxImage}
                onClose={() => setLightboxOpen(false)}
              />
            )}

            {/* 互动区域 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {post.community_name && (
                  <span>
                    📍 {post.community_name}
                    {post.building_number && ` ${post.building_number}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <LikeButton postId={post.id} likesCount={post.likes_count} />
                <span className="text-sm text-muted-foreground">
                  💬 {post.comments_count}
                </span>
                {user && (
                  <ReportButton postId={post.id} token="" />
                )}
              </div>
            </div>

            {/* 评论区 */}
            <CommentsSection
              postId={post.id}
              commentsCount={post.comments_count}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <PostContent />
    </Suspense>
  );
}

export default function PostPage() {
  return (
    <ToastProvider>
      <PostPageWithSuspense />
    </ToastProvider>
  );
}
