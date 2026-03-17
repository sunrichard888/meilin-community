"use client";

import { PostData } from "@/actions/posts";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface PostCardProps {
  post: PostData;
}

function PostCardComponent({ post, onLike, isLiked }: PostCardProps & { onLike?: (id: string) => void; isLiked?: boolean }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <article className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* 头像 */}
        <div className="flex-shrink-0">
          {post.user?.avatar ? (
            <img
              src={post.user.avatar}
              alt={post.user.nickname}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {post.user?.nickname?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          {/* 头部信息 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              {post.user?.nickname || "匿名用户"}
            </span>
            {post.community_name && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {post.community_name}
                  {post.building_number && ` ${post.building_number}`}
                </span>
              </>
            )}
            {post.is_pinned && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                置顶
              </span>
            )}
          </div>

          {/* 帖子内容 */}
          <div className="text-base leading-relaxed whitespace-pre-wrap mb-3">
            {post.content}
          </div>

          {/* 图片（如果有） */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {post.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`图片 ${index + 1}`}
                  className="rounded-lg aspect-square object-cover hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <time dateTime={post.created_at}>{timeAgo}</time>
            
            {/* 互动数据 */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <span>❤️</span>
                <span>{post.likes_count}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <span>💬</span>
                <span>{post.comments_count}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PostCardComponent;
export { PostCardComponent as PostCard };
