"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface NotificationPanelProps {
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationRead: () => void;
}

interface Notification {
  id: string;
  type: string;
  actor_id: string;
  actor_nickname?: string;
  actor_avatar?: string;
  post_id?: string;
  comment_id?: string;
  content?: string;
  read: boolean;
  created_at: string;
  like_count?: number;
}

export default function NotificationPanel({ onClose, onMarkAllRead, onNotificationRead }: NotificationPanelProps) {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          notification_id: notificationId,
          read: true,
        }),
      });

      if (response.ok) {
        onNotificationRead();
        // 更新本地状态
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('确定要删除这条通知吗？')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'mention': return '@';
      case 'system': return '📢';
      default: return '🔔';
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor_nickname || '某人';
    const likeCount = notification.like_count || 1;

    switch (notification.type) {
      case 'like':
        return likeCount > 1
          ? `${actorName} 等 ${likeCount} 人 赞了你的帖子`
          : `${actorName} 赞了你的帖子`;
      case 'comment':
        return `${actorName} 评论了你的帖子`;
      case 'follow':
        return `${actorName} 关注了你`;
      case 'mention':
        return `${actorName} 在评论中提到了你`;
      case 'system':
        return notification.content || '系统通知';
      default:
        return '通知';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.post_id) {
      return `/feed?highlight=${notification.post_id}`;
    }
    if (notification.actor_id) {
      return `/users/${notification.actor_id}`;
    }
    return '/feed';
  };

  return (
    <Card className="absolute right-0 top-12 w-96 max-h-[600px] flex flex-col z-50 shadow-lg border-primary/10 animate-scale-in">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">通知</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-xs h-8"
          >
            全部已读
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            加载中...
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`block p-4 hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* 图标 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{getNotificationText(notification)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(notification.id, e)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors text-xs"
                  >
                    删除
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🎉</div>
            <p>暂无通知</p>
          </div>
        )}
      </div>
    </Card>
  );
}
