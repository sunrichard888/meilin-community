"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ userId, initialFollowing = false }: FollowButtonProps) {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // 检查关注状态
  useEffect(() => {
    if (user && user.id !== userId) {
      checkFollowStatus();
    }
  }, [userId, user]);

  const checkFollowStatus = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/follows/check?user_id=${userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFollowing(result.following);
      }
    } catch (error) {
      console.error('检查关注状态失败:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.id === userId) {
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      
      if (following) {
        // 取消关注
        const response = await fetch(`/api/follows?user_id=${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setFollowing(false);
        } else {
          alert(result.error || '取消关注失败');
        }
      } else {
        // 关注
        const response = await fetch('/api/follows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            followee_id: userId,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setFollowing(true);
        } else {
          alert(result.error || '关注失败');
        }
      }
    } catch (error: any) {
      alert(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 自己不显示关注按钮
  if (user && user.id === userId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={following ? "outline" : "default"}
      size="sm"
      className={following ? "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" : ""}
    >
      {loading ? '处理中...' : following ? '已关注' : '关注'}
    </Button>
  );
}
