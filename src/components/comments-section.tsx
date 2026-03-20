"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    nickname: string;
    avatar?: string;
  };
}

interface CommentsSectionProps {
  postId: string;
  commentsCount: number;
}

export default function CommentsSection({ postId, commentsCount }: CommentsSectionProps) {
  const { user, getToken } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [showComments, setShowComments] = useState(false);

  // 加载评论
  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setComments(result.data || []);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    }
  };

  // 展开评论时加载
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('请先登录');
      return;
    }

    if (!content.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          post_id: postId,
          content,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 添加到评论列表
        setComments(prev => [...prev, result.data]);
        setContent("");
      } else {
        alert(result.error || '评论失败');
      }
    } catch (error: any) {
      alert(error.message || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 从评论列表中移除
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  const toggleShowComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="border-t pt-4 mt-4">
      {/* 评论按钮 */}
      <button
        onClick={toggleShowComments}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        💬
        <span>{commentsCount} 条评论</span>
        <span className={`transform transition-transform ${showComments ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 评论列表 */}
      {showComments && (
        <div className="space-y-4">
          {/* 评论输入框 */}
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的评论..."
                className="min-h-[80px] resize-y flex-1"
                maxLength={500}
              />
              <Button 
                type="submit" 
                disabled={submitting || !content.trim()}
                className="self-end"
              >
                {submitting ? '发送中...' : '评论'}
              </Button>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              请先登录后再评论
            </div>
          )}

          {/* 评论列表 */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  {/* 头像 */}
                  <div className="flex-shrink-0">
                    {comment.user?.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.nickname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {comment.user?.nickname?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* 评论内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">
                        {comment.user?.nickname || '匿名用户'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                        {user && user.id === comment.user_id && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无评论，快来抢沙发吧～
            </div>
          )}
        </div>
      )}
    </div>
  );
}
