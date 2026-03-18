"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  likesCount: number;
  initialLiked?: boolean;
}

export default function LikeButton({ postId, likesCount: initialLikesCount, initialLiked = false }: LikeButtonProps) {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  // 检查用户是否已点赞
  useEffect(() => {
    if (user) {
      checkLikeStatus();
    }
  }, [postId, user]);

  const checkLikeStatus = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/likes?post_id=${postId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLiked(result.liked);
      }
    } catch (error) {
      console.error('检查点赞状态失败:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          post_id: postId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 更新状态
        setLiked(result.liked);
        setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
      } else {
        alert(result.error || '操作失败');
      }
    } catch (error: any) {
      alert(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors ${
        liked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-muted-foreground hover:text-red-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={liked ? '取消点赞' : '点赞'}
    >
      <span className={`transform transition-transform ${liked ? 'scale-110' : ''}`}>
        ❤️
      </span>
      <span className="text-sm">{likesCount}</span>
    </button>
  );
}
