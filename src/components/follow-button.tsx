"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export default function FollowButton({
  targetUserId,
  variant = 'default',
  size = 'default',
}: FollowButtonProps) {
  const { showToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/follows/check?target_user_id=${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setIsFollowing(data.is_following || false);
    } catch (error) {
      console.error('Check follow status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!localStorage.getItem('token')) {
      showToast('请先登录', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsFollowing(!isFollowing);
        showToast(
          isFollowing ? '已取消关注' : '关注成功',
          'success'
        );
      } else {
        showToast(result.error || '操作失败', 'error');
      }
    } catch (error: any) {
      console.error('Toggle follow error:', error);
      showToast('操作失败', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        加载中...
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={actionLoading}
    >
      {isFollowing ? '👤 已关注' : '➕ 关注'}
    </Button>
  );
}
