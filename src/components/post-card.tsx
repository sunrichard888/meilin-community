"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageGrid } from "@/components/ui/image-grid";
import { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  isLiked?: boolean;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString("zh-CN");
  } catch {
    return "未知时间";
  }
}

export function PostCard({ post, onLike, isLiked = false }: PostCardProps) {
  const likesCount = post.likes_count || 0;
  const commentsCount = post.comments_count || 0;

  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarFallback className="bg-muted font-medium">
              {post.user?.nickname?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold hover:text-primary transition-colors cursor-pointer">
                {post.user?.nickname || "匿名用户"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
            {post.images && post.images.length > 0 && (
              <ImageGrid images={post.images} alt={`${post.user?.nickname} 分享的图片`} />
            )}
            <div className="flex items-center gap-1 mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className={
                  isLiked
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:bg-primary/10 hover:text-primary"
                }
                aria-label={`点赞，当前${likesCount}个赞`}
              >
                <span aria-hidden="true">👍</span>
                <span className="ml-1">{likesCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent/10 hover:text-accent"
                aria-label={`${commentsCount} 条评论`}
              >
                <span aria-hidden="true">💬</span>
                <span className="ml-1">{commentsCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto hover:bg-secondary/10"
                aria-label="分享"
              >
                <span aria-hidden="true">🔗</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
