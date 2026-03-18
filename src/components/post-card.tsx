"use client";

import { useState } from "react";
import { PostData } from "@/actions/posts";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import ReportButton from "./report-button";
import ImageLightbox from "./image-lightbox";
import LikeButton from "./like-button";
import CommentsSection from "./comments-section";

interface PostCardProps {
  post: PostData;
  userToken?: string;
}

function PostCardComponent({ post, userToken, onLike, isLiked }: PostCardProps & { onLike?: (id: string) => void; isLiked?: boolean }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src: string, alt: string) => {
    setLightboxImage(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };
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
              loading="lazy"
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
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

            {/* 举报按钮（右上角） */}
            {userToken && (
              <div className="flex-shrink-0">
                <ReportButton postId={post.id} token={userToken} />
              </div>
            )}
          </div>

          {/* 帖子内容 */}
          <div className="text-base leading-relaxed whitespace-pre-wrap mb-3">
            {post.content}
          </div>

          {/* 图片（如果有） */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {post.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`图片 ${index + 1}`}
                  className="rounded-lg aspect-square object-cover hover:opacity-80 transition-opacity cursor-pointer"
                  loading="lazy"
                  onClick={() => openLightbox(img, `图片 ${index + 1}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightbox(img, `图片 ${index + 1}`);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* 图片放大预览 */}
          {lightboxOpen && (
            <ImageLightbox
              src={lightboxImage}
              alt={lightboxAlt}
              onClose={closeLightbox}
            />
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <time dateTime={post.created_at}>{timeAgo}</time>
            
            {/* 点赞按钮 */}
            <LikeButton 
              postId={post.id} 
              likesCount={post.likes_count} 
            />
          </div>

          {/* 评论区 */}
          <CommentsSection 
            postId={post.id} 
            commentsCount={post.comments_count} 
          />
        </div>
      </div>
    </article>
  );
}

export default PostCardComponent;
export { PostCardComponent as PostCard };
