"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface LikeButtonProps {
  postId: string;
  likesCount: number;
}

// 点赞状态缓存（内存缓存，10 分钟过期）
const likeCache = new Map<string, { liked: boolean; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 分钟

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function LikeButton({ postId, likesCount: initialLikesCount }: LikeButtonProps) {
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  // 从缓存读取点赞状态
  const getCachedLike = useCallback(() => {
    const cached = likeCache.get(postId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.liked;
    }
    return null;
  }, [postId]);

  // 写入缓存
  const setCachedLike = useCallback((liked: boolean) => {
    likeCache.set(postId, { liked, timestamp: Date.now() });
  }, [postId]);

  // 检查点赞状态（带缓存）
  const checkLikeStatus = useCallback(async () => {
    const cached = getCachedLike();
    if (cached !== null) {
      setIsLiked(cached);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLiked(false);
        return;
      }

      const res = await fetch(`/api/likes?post_id=${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked || false);
        setCachedLike(data.liked || false);
      }
    } catch (error) {
      console.error('Check like status error:', error);
    }
  }, [postId, getCachedLike, setCachedLike]);

  useEffect(() => {
    checkLikeStatus();
  }, [checkLikeStatus]);

  // 防抖的点赞处理
  const debouncedToggleLike = useMemo(
    () => debounce(async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('请先登录', 'error');
        return;
      }

      setLoading(true);
      try {
        // 乐观更新
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => prev + (isLiked ? -1 : 1));

        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ post_id: postId }),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          setCachedLike(result.liked);
        } else {
          // 回滚
          setIsLiked((prev) => !prev);
          setLikesCount((prev) => prev + (result.liked ? 1 : -1));
          showToast(result.error || '操作失败', 'error');
        }
      } catch (error: any) {
        console.error('Toggle like error:', error);
        // 回滚
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => prev + (isLiked ? 1 : -1));
        showToast('操作失败', 'error');
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms 防抖
    [postId, isLiked, showToast, setCachedLike]
  );

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={debouncedToggleLike}
      disabled={loading}
      className={`flex items-center gap-1 ${
        isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'
      }`}
    >
      {isLiked ? '❤️' : '🤍'}
      <span>{likesCount}</span>
    </Button>
  );
}
